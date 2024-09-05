<template>
  <div>
    <h1>Upload Audio</h1>
    <input type="file" @change="handleFileUpload" accept="audio/*" />
    <button @click="processAndSendAudio">Upload & Send</button>
  </div>
</template>

<script>
import { InferenceSession, Tensor } from 'onnxruntime-web';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

export default {
  data() {
    return {
      audioFile: null,
      ffmpegInstance: null, 
    };
  },
  methods: {
    async loadFFmpeg() {
      if (!this.ffmpegInstance) {
        this.ffmpegInstance = createFFmpeg({ log: true });
        await this.ffmpegInstance.load();
      }
    },
    handleFileUpload(event) {
      this.audioFile = event.target.files[0];
    },
    async processAndSendAudio() {
      if (!this.audioFile) {
        alert("Please upload an audio file.");
        return;
      }

      await this.loadFFmpeg();  

      const convertedAudioBuffer = await this.convertAudioTo24kHz(this.audioFile);

      const encodedAudio = await this.encodeWithEnCodec(convertedAudioBuffer);

      const formData = new FormData();
      formData.append("encodedAudio", new Blob([encodedAudio]), "encoded_audio.bin");

      await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData,
      });

      alert("Audio uploaded and sent successfully!");
    },
    async convertAudioTo24kHz(file) {
      const { ffmpegInstance } = this;
      const audioData = await fetchFile(file); 

      ffmpegInstance.FS('writeFile', 'input.wav', audioData);

      await ffmpegInstance.run('-i', 'input.wav', '-ar', '24000', 'output.wav');
      const outputData = ffmpegInstance.FS('readFile', 'output.wav');

      return outputData.buffer;
    },
    async encodeWithEnCodec(audioBuffer) {
      const session = await InferenceSession.create('./encodec_model.onnx');

      const audioTensor = new Tensor('float32', new Float32Array(audioBuffer), [1, audioBuffer.byteLength]);

      const input = { audio: audioTensor };
      const results = await session.run(input);

      return results['encoded_audio'].data;
    },
  },
};
</script>
