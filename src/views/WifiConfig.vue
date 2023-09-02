<template>
  <v-container>
    <v-card>
      <v-card-title>Wi-Fi設�?</v-card-title>
      <v-card-text>
        <v-form>
          <v-select label="�?バイスID" v-model="deviceId" :items="[1, 2, 3, 4, 5, 6, 7, 8, 9]"></v-select>
          <v-select label="接続モー�?" v-model="connectionModeStr" :items="connectionModes"></v-select>
          <v-row>
            <v-col v-for="(item, index) in ipAddress" :key="index">
              <v-text-field :label="`IPアドレス${index + 1}`" v-model="ipAddress[index]" type="number" min="0" max="255"></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col v-for="(item, index) in subnetAddress" :key="index">
              <v-text-field :label="`サブネ�?トアドレス${index + 1}`" v-model="subnetAddress[index]" type="number" min="0" max="255"></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col v-for="(item, index) in defaultGateway" :key="index">
              <v-text-field :label="`�?フォルトゲートウェイ${index + 1}`" v-model="defaultGateway[index]" type="number" min="0" max="255"></v-text-field>
            </v-col>
          </v-row>
          <v-text-field label="SSID" v-model="ssid" maxlength="32"></v-text-field>
          <v-text-field label="パスワー�?" v-model="password" type="password" maxlength="32"></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-col cols="2" >
          <v-btn @click="sendData">設定をESP32に送信</v-btn>
        </v-col>
        <v-col cols="3" >
          <v-text-field :label="`送信URL`" v-model="esp32url" @blur="intervalFunc1500" ></v-text-field>
        </v-col>
        <v-col cols="2" >
          <v-text-field readonly  :label="`ConnectStatus`" v-model="connect_status" ></v-text-field>
        </v-col>        
      </v-card-actions>
      <v-card-actions>
        <v-btn @click="saveSettings">設定をブラウザに保�?</v-btn>
      </v-card-actions>
      <v-card-actions>
        <v-btn @click="loadSettings">設定をブラウザから読込</v-btn>
      </v-card-actions>      

    </v-card>
  </v-container>
</template>

<script>

import axios from 'axios';

export default {
  data() {
    return {
      deviceId: 1,
      connectionModes: ['0: APモー�?(WiFiを発信)', '1: STモー�?(他�?�WiFiへ接�?)' ],
      connectionModeStr: '',
      connectionMode: 0,
      ipAddress: [0,0,0,0],
      subnetAddress: [0,0,0,0],
      defaultGateway: [0,0,0,0],
      ssid: '',
      password: '',
      esp32url: '',
      esp32ip: '',
      connect_status:'NON',
    };
  },
  created () {
     this.loadSettings_no_confirm();
     this.esp32url = window.location.href;// + 'posteep';
     setInterval(this.intervalFunc1500, 3000);
  },
  methods: {

    // POSTする�?ータを返す関数
    getData() {
      const deviceId = this.deviceId;
      const connectionModeTemp = this.connectionModeStr.split(':');
      var mode = parseInt(connectionModeTemp[0]);
      if( !( mode === 0 || mode === 1 ) ){
        mode = 0;

      }

      const subnetMask = this.subnetAddress;
      const defaultGateway = this.defaultGateway;
      const ip = this.ipAddress;
      const ssid = this.ssid;
      const password = this.password;

      //console.log(ip)

      return {
        device_id: deviceId,
        connect_mode: mode,
        // ip_addr: ip,
        // subnet: subnetMask,
        // gateway: defaultGateway,

        ip_addr0: ip[0],
        ip_addr1: ip[1],
        ip_addr2: ip[2],
        ip_addr3: ip[3],

        subnet0: subnetMask[0],
        subnet1: subnetMask[1],
        subnet2: subnetMask[2],
        subnet3: subnetMask[3],

        gateway0: defaultGateway[0],
        gateway1: defaultGateway[1],
        gateway2: defaultGateway[2],
        gateway3: defaultGateway[3],
        
        ssid: ssid,
        password: password
      };
    },
    
    saveSettings() {
      if (confirm("保存しますか?�?")) {        
        localStorage.setItem("wifiSettings", JSON.stringify(this.getData()));
      }
    },
    loadSettings() {
      if (confirm("読み込みますか?�?")) {
        this.loadSettings_no_confirm()
      }

    },
    loadSettings_no_confirm() {
      const data = JSON.parse(localStorage.getItem("wifiSettings"));

        if (data !== null) {

          console.log(data)

          this.deviceId = data.device_id;
          this.connectionModeStr = this.connectionModes[ data.connect_mode ];

          this.ipAddress[0] = ( data.ip_addr0 ) ;
          this.ipAddress[1] = ( data.ip_addr1 );
          this.ipAddress[2] = ( data.ip_addr2 );
          this.ipAddress[3] = ( data.ip_addr3 );

          this.ipAddress.splice();

          this.subnetAddress[0] = data.subnet0;
          this.subnetAddress[1] = data.subnet1;
          this.subnetAddress[2] = data.subnet2;
          this.subnetAddress[3] = data.subnet3;

          this.subnetAddress.splice();

          this.defaultGateway[0] = data.gateway0;
          this.defaultGateway[1] = data.gateway1;
          this.defaultGateway[2] = data.gateway2;
          this.defaultGateway[3] = data.gateway3;

          this.defaultGateway.splice();

          this.ssid = data.ssid;
          this.password = data.password;
          console.log(this.ipAddress)
          console.log(this.ipAddress.length)
        }      
    },

    getEsp32Url(){
      //console.log( "URL:  "+this.esp32url );
      return this.esp32url;
    },

    async sendData() {
        //const currentUrl = window.location.href;
        const senddata = this.getData();
        console.log( senddata );
        //console.log( window.location.href + 'posteep' );
        //this.esp32url = window.location.href + 'posteep';
        await axios
          //.post( window.location.href + 'posteep',this.getData() )
          .post( this.getEsp32Url()  + 'posteep' , this.getData() )
          //.post('http://192.168.10.135/posteep', senddata )
          .then((res) => {                
            console.log(res);
            this.posts = res.data.posts;
            this.connect_status = 'Write OK';
          })
          .catch((err) => {
            console.log(err);
            this.connect_status = 'NG';
          });
           
    },

    async sendCheck() {
        await axios
          .post( this.getEsp32Url()  + 'postcheck' , "" )
          .then((res) => {                
            //console.log(res.data);
            this.esp32ip = res.data;
            this.posts = res.data.posts;
            this.connect_status = 'OK';
            this.$_setGlobalEsp32ip( this.esp32ip );
            console.log('sendCheck postURL:',this.getEsp32Url()  + 'postcheck');
            console.log('sendCheck getIP:',this.$_getGlobalEsp32ip());
            
          })
          .catch(() => {
            //console.log(err);
            this.connect_status = 'NG';
          });
           
    },

    intervalFunc1500:function(){
      this.sendCheck();
      this.$_setGlobalUrl( this.esp32url );


    },

        
  },    
};
</script>
