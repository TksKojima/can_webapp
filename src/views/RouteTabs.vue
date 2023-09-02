<template>
  <v-card>
    <v-toolbar
      color="gray"
      dark
      flat
    >
      <!-- <v-app-bar-nav-icon></v-app-bar-nav-icon>

      <v-toolbar-title>Your Dashboard</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon>
        <v-icon>mdi-magnify</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn> -->

      <!-- <template  v-slot:extension> -->
      <template  >
        <v-tabs v-model="tabnum" align-with-title  >
          <!-- <v-tabs-slider color="yellow"></v-tabs-slider> -->
          <!-- <v-tab v-for="item in items" :key="item" :href="tab" >
            {{ item }}
          </v-tab> -->
          <v-tab  > WiFiConfig   </v-tab>
          <v-tab  > CanRx   </v-tab>
          <v-tab  > CanTx  </v-tab>
          <v-tab  > Plot  </v-tab>

        </v-tabs>
      </template>
    </v-toolbar>

    <v-tabs-items v-model="tabnum" :touchless="true">
      <v-tab-item>        
          <v-card>
              <v-card-text>
                <wificonfig ></wificonfig>
              </v-card-text>
          </v-card>
      </v-tab-item>

      <v-tab-item>        
          <v-card>
              <v-card-text>
                <canrecv ></canrecv>
              </v-card-text>
          </v-card>
      </v-tab-item>

      <v-tab-item>
          <v-card>
              <v-card-text>
                <cantrans ></cantrans>
              </v-card-text>
          </v-card>
      </v-tab-item>

    </v-tabs-items>

  </v-card>
</template>


<script>
import canrecv from './CanRecv.vue'
import cantrans from './CanTrans.vue'
import wificonfig from './WifiConfig.vue'

  export default {
    components:{
        canrecv,
        cantrans,
        wificonfig

    },

    data () {
      return {
        tabnum: 1,
        items: [
          'web', 'shopping', 'videos', 'images', 'news',
        ],
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',

        canrx_url:"/tab?tabnum=1",
        tab_url:"tab",

      }
    },
    created:function() {
      this.tabnum = Number( this.$route.query.tabnum );
      

    },
    methods: {
      goToCanRx() {
        let newUrl = `/tab?tabnum=1`;
        this.$router.push(newUrl);
      },


    }
  }
</script>

<style>
a{
  color:inherit;
  text-decoration: none;
}
</style>




