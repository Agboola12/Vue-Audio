

<!-- <template>
  <div>
    <h1>{{ result }}</h1>

    <form @submit.prevent="onCreate" enctype="multipart/form-data">
      <label class="col-md-2 fw-bold">Mp3:</label>
      <input type="file" ref="mp3" @change="handleMp3Change" class="col-md-4">
      <input type="submit" value="Submit" class="btn btn ml-5 w-50 p-5 text-light">
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      mp3File: null,
      result: '',  
    };
  },
  methods: {
    handleMp3Change(e) {
     
      const file = e.target.files[0];
      if (file) {
        this.mp3File = file;
        console.log('Selected file:', this.mp3File);
      } else {
        console.error('No file selected.');
      }
    },
 
    async onCreate() {
      if (!this.mp3File) {
        alert("Please select an MP3 file");
        return;
      }


      const formData = new FormData();
      formData.append('encodedAudio', this.mp3File);

      try {
        const response = await axios.post("http://localhost:3000/upload", formData);

        this.result = response.data.message;


        if (response.data.status) {
        }
      } catch (err) {
        console.error('Error uploading file:', err);
      }
    },
  },
};
</script> -->

<template>
  <div>
    <h1>{{ result }}</h1>

    <form @submit.prevent="onCreate" enctype="multipart/form-data">
      <label class="col-md-2 fw-bold">Mp3:</label>
      <input type="file" ref="mp3" @change="handleMp3Change" class="col-md-4">
      <input type="submit" value="Submit" class="btn btn ml-5 w-50 p-5 text-light">
    </form>
  </div>
</template>

<script>
import axios from 'axios';
import { InferenceSession, Tensor } from 'onnxruntime-web';


export default {
  data() {
    return {
      mp3File: null,
      result: '',  
    };
  },
  methods: {
    handleMp3Change(e) {
      const file = e.target.files[0];
      if (file) {
        this.mp3File = file;
        console.log('Selected file:', this.mp3File);
      } else {
        console.error('No file selected.');
      }
    },

    async encodeWithEnCodec(audioBuffer) {
      // const session = await InferenceSession.create('./encodec_model.onnx');
      const session = await InferenceSession.create('./encodec_model.onnx', {
    executionProviders: ['cpu'],
});


      const audioTensor = new Tensor('float32', new Float32Array(audioBuffer), [1, audioBuffer.byteLength]);
      const input = { audio: audioTensor };
      const results = await session.run(input);

      return results['encoded_audio'].data; // EnCodec encoded audio
    },

    async onCreate() {
      if (!this.mp3File) {
        alert("Please select an MP3 file");
        return;
      }

      const audioBuffer = await this.mp3File.arrayBuffer(); // Get raw audio data
      const encodedAudio = await this.encodeWithEnCodec(audioBuffer); // Encode using EnCodec

      const formData = new FormData();
      formData.append('encodedAudio', new Blob([encodedAudio]), "encoded_audio.bin"); // Send encoded binary data

      try {
        const response = await axios.post("http://localhost:3000/upload", formData);
        this.result = response.data.message;

        if (response.data.status) {
          console.log('Audio uploaded and encoded successfully');
        }
      } catch (err) {
        console.error('Error uploading file:', err);
      }
    },
  },
};
</script>

