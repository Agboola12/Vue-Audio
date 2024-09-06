<!-- <template>
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
</script> -->


<template>
  <div>

    {{ result }}

    <form action="post"  method="post" enctype="multipart/form-data" @submit.prevent="onCreate">
  <label class="col-md-2 fw-bold">Mp3:</label>
  <input type="file"  ref="mp3" @change="handleMp3Change" class="col-md-4"  >
  <input type="submit"  value="Submit" class="btn btn ml-5  w-50 p-5 text-light" />
</form>

  </div>
</template>

<script>
import axios from 'axios';



export default {
  data() {
    return {
      mp3File: null,
    };
  },
  methods: {
    

    handleMp3Change(e) {
    this.mp3File = e.target.files[0]
    },
 
    onCreate (){
      const formData = new FormData();
      formData.append('encodedAudio', this.mp3File);

      axios.post
            ("http://localhost:3000/upload",  formData)
            .then(res =>{
                const result= res.data.message;    
                toast(result, {
                    autoClose: 5000,
                  });

                if(res.data.status){
                  console.log(res.data.data)
                }
            })
            .catch(err =>{
                console.log(err);
            })

    },
    
  },
};
</script>
