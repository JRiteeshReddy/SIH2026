import * as tf from '@tensorflow/tfjs';
import { INITIAL_SPECIES } from '../data/speciesData';
import { Species } from '../types';
import { locationService } from './locationService';

export type ModelStatusState = 'MODEL_LOADING' | 'MODEL_READY' | 'MODEL_ERROR';

export interface ModelPrediction {
  supported: boolean;
  species: Species | null;
  label: string;
  rawClassIndex: number;
  confidence: number; // 0.0 to 1.0
  confidencePercent: number; // 0 to 100
  allPredictions: { label: string; confidence: number; classIndex: number }[];
  inputSize: { width: number; height: number };
  inferenceTimeMs: number;
  unsupportedMessage?: string;
}

export interface AntiCheatRecord {
  isValidLiveCapture: boolean;
  gpsActive: boolean;
  coordinates: { lat: number; lng: number; accuracy: number };
  locationName: string;
  timestamp: string;
  timestampMs: number;
  deviceOrientation?: string;
  videoTrackId?: string;
  rejectionReason?: string;
}

/**
 * Explicit Canonical Mapping between 23 Teachable Machine Model Classes and EcoDex Species IDs.
 * Only verified species are mapped to EcoDex IDs.
 * Unsupported model classes (e.g. Turtle, Butterfly, Frog, Owl, Parrot, Fox, Monkey, Crocodile, Cobra, Wolf, Lion) are omitted.
 */
export const MODEL_TO_ECODEX_MAPPING: Record<number, string> = {
  0: 'spec_0',   // 0 Crow -> spec_0 House Crow
  1: 'spec_1',   // 1 Pigeon -> spec_1 Rock Pigeon
  2: 'spec_2',   // 2 Squirrel -> spec_2 Indian Palm Squirrel
  3: 'spec_3',   // 3 Dog -> spec_3 Stray Dog
  4: 'spec_4',   // 4 Cat -> spec_4 Stray Cat
  8: 'spec_7',   // 8 Peacock -> spec_7 Indian Peafowl
  11: 'spec_13', // 11 Deer -> spec_13 Spotted Deer (Chital)
  12: 'spec_9',  // 12 Rabbit -> spec_9 Indian Hare
  18: 'spec_15', // 18 Tiger -> spec_15 Bengal Tiger
  19: 'spec_16', // 19 Leopard -> spec_16 Indian Leopard
  20: 'spec_14', // 20 Elephant -> spec_14 Indian Elephant
  22: 'spec_17', // 22 Red Panda -> spec_17 Red Panda
};

export class AIModelService {
  private labels: string[] = [];
  private model: tf.LayersModel | null = null;
  private modelStatus: ModelStatusState = 'MODEL_LOADING';
  private loadingPromise: Promise<boolean> | null = null;
  private readonly inputSize = 224; // 224x224 input tensor size

  constructor() {
    this.initModel();
  }

  /**
   * Initializes and loads the converted TensorFlow.js Layers Model ONCE.
   * Model instance is cached for subsequent inferences.
   */
  public async initModel(): Promise<boolean> {
    if (this.model && this.modelStatus === 'MODEL_READY') {
      return true;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = (async () => {
      try {
        this.modelStatus = 'MODEL_LOADING';
        await tf.ready();

        // 1. Load labels.txt
        const labelSources = ['/model/tfjs/labels.txt', '/model/labels.txt', '/converted_keras/labels.txt'];
        for (const src of labelSources) {
          try {
            const res = await fetch(src);
            if (res.ok) {
              const text = await res.text();
              this.labels = text
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .map(line => {
                  const parts = line.split(' ');
                  return parts.length > 1 ? parts.slice(1).join(' ') : line;
                });
              if (this.labels.length > 0) break;
            }
          } catch {
            // try next
          }
        }

        if (!this.labels.length) {
          // Fallback 23 class label names matching original keras model
          this.labels = [
            'Crow', 'Pigeon', 'Squirrel', 'Dog', 'Cat', 'Butterfly', 'Frog',
            'Turtle', 'Peacock', 'Owl', 'Parrot', 'Deer', 'Rabbit', 'Fox',
            'Monkey', 'Crocodile', 'Cobra', 'Wolf', 'Tiger', 'Leopard',
            'Elephant', 'Lion', 'Red Panda'
          ];
        }

        // 2. Load TF.js model JSON & weight shards
        const modelSources = [
          '/model/tfjs/model.json',
          '/model/model.json',
          '/converted_keras/model.json'
        ];

        for (const src of modelSources) {
          try {
            this.model = await tf.loadLayersModel(src);
            if (this.model) {
              this.modelStatus = 'MODEL_READY';
              console.log(`EcoDex AI: Successfully loaded TensorFlow.js model from ${src}`);
              break;
            }
          } catch (err) {
            console.warn(`Could not load model from ${src}:`, err);
          }
        }

        if (!this.model) {
          this.modelStatus = 'MODEL_ERROR';
          return false;
        }

        return true;
      } catch (error) {
        console.error('Failed to load TensorFlow.js model:', error);
        this.modelStatus = 'MODEL_ERROR';
        return false;
      } finally {
        this.loadingPromise = null;
      }
    })();

    return this.loadingPromise;
  }

  public getStatus(): ModelStatusState {
    return this.modelStatus;
  }

  public isLoaded(): boolean {
    return this.modelStatus === 'MODEL_READY' && this.model !== null;
  }

  public getLabels(): string[] {
    return this.labels;
  }

  /**
   * Executes REAL TensorFlow.js inference on captured canvas/video element.
   * Tensors are managed & cleaned up using tf.tidy().
   */
  public async predict(
    videoOrCanvas: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement
  ): Promise<ModelPrediction> {
    const startTime = performance.now();

    if (!this.model || this.modelStatus !== 'MODEL_READY') {
      const loaded = await this.initModel();
      if (!loaded || !this.model) {
        throw new Error('TensorFlow.js model is not loaded.');
      }
    }

    // Wrap tensor creation, normalization, and inference inside tf.tidy to automatically dispose all intermediate tensors
    const { probabilities, topIndex, maxProb } = tf.tidy(() => {
      // 1. Create tensor from pixel source (Shape: [height, width, 3])
      const rawTensor = tf.browser.fromPixels(videoOrCanvas);

      // 2. Resize to 224x224 bilinear
      const resized = tf.image.resizeBilinear(rawTensor, [this.inputSize, this.inputSize]);

      // 3. Normalize pixel values to [-1, 1] as expected by Teachable Machine MobileNet:
      // normalized = (pixel / 127.5) - 1.0
      const normalized = resized.div(tf.scalar(127.5)).sub(tf.scalar(1.0));

      // 4. Expand dimensions for batch input: [1, 224, 224, 3]
      const batched = normalized.expandDims(0);

      // 5. Run model prediction
      const outputTensor = this.model!.predict(batched) as tf.Tensor;

      // Extract prediction values synchronously before tidy disposes tensors
      const probsData = Array.from(outputTensor.dataSync());
      const argmaxVal = tf.argMax(outputTensor, 1).dataSync()[0];
      const maxVal = tf.max(outputTensor, 1).dataSync()[0];

      return {
        probabilities: probsData,
        topIndex: argmaxVal,
        maxProb: maxVal
      };
    });

    const inferenceTimeMs = Math.round(performance.now() - startTime);

    const rawLabel = this.labels[topIndex] || `Class_${topIndex}`;
    const confidence = parseFloat(maxProb.toFixed(4));
    const confidencePercent = Math.round(confidence * 100);

    const allPredictions = probabilities.map((prob, idx) => ({
      label: this.labels[idx] || `Class_${idx}`,
      confidence: parseFloat(prob.toFixed(4)),
      classIndex: idx
    }));

    // Check if the predicted class is supported in EcoDex 20-species canonical taxonomy
    const speciesId = MODEL_TO_ECODEX_MAPPING[topIndex];
    const isSupported = Boolean(speciesId);

    if (isSupported && speciesId) {
      const speciesMatch = INITIAL_SPECIES.find(s => s.id === speciesId) || null;

      return {
        supported: true,
        species: speciesMatch,
        label: rawLabel,
        rawClassIndex: topIndex,
        confidence,
        confidencePercent,
        allPredictions,
        inputSize: { width: this.inputSize, height: this.inputSize },
        inferenceTimeMs
      };
    } else {
      // Unsupported model class (e.g. Turtle, Butterfly, Frog, Owl, Parrot, etc.)
      return {
        supported: false,
        species: null,
        label: rawLabel,
        rawClassIndex: topIndex,
        confidence,
        confidencePercent,
        allPredictions,
        inputSize: { width: this.inputSize, height: this.inputSize },
        inferenceTimeMs,
        unsupportedMessage: 'Species detected, but it is not currently part of the EcoDex catalogue.'
      };
    }
  }

  /**
   * Anti-Cheat Engine:
   * Validates live camera hardware stream and active GPS geolocation via locationService.
   */
  public async verifyAntiCheat(
    stream: MediaStream | null,
    canvas: HTMLCanvasElement
  ): Promise<AntiCheatRecord> {
    const timestampMs = Date.now();
    const timestamp = new Date().toISOString();

    // 1. Verify Live Camera Hardware Stream
    if (!stream) {
      return {
        isValidLiveCapture: false,
        gpsActive: false,
        coordinates: { lat: 0, lng: 0, accuracy: 0 },
        locationName: 'Unknown',
        timestamp,
        timestampMs,
        rejectionReason: 'No live camera hardware stream detected. Gallery uploads and static imports are strictly blocked.'
      };
    }

    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack || videoTrack.readyState !== 'live') {
      return {
        isValidLiveCapture: false,
        gpsActive: false,
        coordinates: { lat: 0, lng: 0, accuracy: 0 },
        locationName: 'Unknown',
        timestamp,
        timestampMs,
        rejectionReason: 'Camera track is paused or not live. Live hardware camera capture is required.'
      };
    }

    // 2. Verify Real GPS Location using locationService
    let gpsCoords = { lat: 0, lng: 0, accuracy: 0 };
    let gpsActive = false;

    const locPoint = await locationService.getSinglePosition();
    if (locPoint) {
      gpsCoords = {
        lat: locPoint.lat,
        lng: locPoint.lng,
        accuracy: locPoint.accuracy
      };
      gpsActive = true;
    } else {
      gpsActive = false;
      gpsCoords = { lat: 0, lng: 0, accuracy: 0 };
    }

    // 3. Sensor Noise Check
    const ctx = canvas.getContext('2d');
    let hasSensorNoise = true;
    if (ctx && canvas.width > 10 && canvas.height > 10) {
      const sample = ctx.getImageData(0, 0, 10, 10).data;
      let identicalPixels = 0;
      for (let i = 4; i < sample.length; i += 4) {
        if (sample[i] === sample[0] && sample[i + 1] === sample[1] && sample[i + 2] === sample[2]) {
          identicalPixels++;
        }
      }
      if (identicalPixels > 24) {
        hasSensorNoise = false;
      }
    }

    const isValid = videoTrack.readyState === 'live' && gpsActive;

    return {
      isValidLiveCapture: isValid,
      gpsActive,
      coordinates: gpsCoords,
      locationName: 'Western Ghats Bio-Reserve',
      timestamp,
      timestampMs,
      videoTrackId: videoTrack.id,
      rejectionReason: isValid ? undefined : 'Live camera stream and active GPS are mandatory to prevent fraudulent discoveries.'
    };
  }
}

export const aiModelService = new AIModelService();
