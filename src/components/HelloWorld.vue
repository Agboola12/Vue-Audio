<template>
  <div>
    <h1>Upload Audio</h1>
    <input type="file" @change="handleFileUpload" accept="audio/*" />
    <button @click="processAndSendAudio">Upload & Send</button>
  </div>
</template>

<script>
import { InferenceSession } from 'onnxruntime-web'; // Import ONNX for EnCodec

export default {
  data() {
    return {
      audioFile: null,
    };
  },
  methods: {
    handleFileUpload(event) {
      this.audioFile = event.target.files[0];
    },
    async processAndSendAudio() {
      if (!this.audioFile) {
        alert("Please upload an audio file.");
        return;
      }

      // Convert the audio to 24kHz using ffmpeg (via WebAssembly)
      const convertedAudioBuffer = await this.convertAudioTo24kHz(this.audioFile);

      // Encode the audio using EnCodec (ONNX runtime)
      const encodedAudio = await this.encodeWithEnCodec(convertedAudioBuffer);

      // Send the encoded audio to the backend
      const formData = new FormData();
      formData.append("encodedAudio", new Blob([encodedAudio]), "encoded_audio.bin");

      await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData,
      });

      alert("Audio uploaded and sent successfully!");
    },
    async convertAudioTo24kHz(file) {
      // Use ffmpeg to convert the audio to 24kHz (e.g., with ffmpeg.wasm)
      // This is a simplified example. You'll need to set up ffmpeg.wasm in your project.
      const ffmpeg = await import('@ffmpeg/ffmpeg');
      const { createFFmpeg } = ffmpeg;
      const ffmpegInstance = createFFmpeg({ log: true });
      await ffmpegInstance.load();
      
      const audioData = await file.arrayBuffer();
      ffmpegInstance.FS('writeFile', 'input.wav', new Uint8Array(audioData));

      await ffmpegInstance.run('-i', 'input.wav', '-ar', '24000', 'output.wav');
      const outputData = ffmpegInstance.FS('readFile', 'output.wav');

      return outputData.buffer;
    },
    async encodeWithEnCodec(audioBuffer) {
      // Load the EnCodec model using ONNX runtime and encode the audioBuffer
      const session = await InferenceSession.create('./encodec_model.onnx');
      const audioTensor = new Float32Array(audioBuffer); // Ensure this matches the model input

      const input = { audio: audioTensor };
      const results = await session.run(input);

      return results['encoded_audio'].data;
    },
  },
};
</script>
