

<template>
  <div>
        <v-container >
        <v-row>
          <v-col cols="12" sm="2" >
            <v-row>
            <v-col cols="6" sm="12">
              <v-switch v-model="toggle_rx_msg" :label="`CAN受信`"></v-switch>
            </v-col>
            <v-col cols="6" sm="12">
              <v-text-field
                label="IDフィルタ"
                placeholder="ex: 0x01, 0x0Y-0x0X, 0xZZ"
                v-model="idfilter_val"
                @blur ="idFilterInput(idfilter_val)"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="5" sm="12">
              <v-switch v-model="toggle_sort" :label="`自動ソート: ${sortTargetStr()}   `"></v-switch>
            </v-col>
            <v-col cols="4" sm="12">
              <v-switch v-model="toggle_hex" :label="`16進表示`"></v-switch>
            </v-col>
            <v-col cols="3" sm="12">
              <v-text-field
                :value=timecnt
                label="動作カウント"
                class="centered-input"
                disabled
              ></v-text-field>
            </v-col>
          </v-row>

        </v-col>
        <v-col cols="12" sm="10" >

        <!-- {{connect_status}} -->
          <table class="canrecv_table" aria-describedby="listhelp">
              <thead>
                  <tr>
                      <th  @click="sortMsg( 0, 1 )" style="cursor:pointer" >ID  {{sort_direction_str[0]}} </th>
                      <th  @click="sortMsg( 1, 1 )" style="cursor:pointer" >dlc {{sort_direction_str[1]}} </th>
                      <th  @click="sortMsg( 2, 1 )" style="cursor:pointer">time{{sort_direction_str[2]}} </th>

                      <th>data0</th>
                      <th>data1</th>
                      <th>data2</th>
                      <th>data3</th>
                      <th>data4</th>
                      <th>data5</th>
                      <th>data6</th>
                      <th>data7</th>
                      <th>delay</th>

                  </tr>
                   
              </thead>

              <tbody>
                <tr v-for="(n,i) in id_num"  v-bind:key="n" >
                  <td  v-bind:style="{color:colorStr( can_msgs[i].updatecount)}" scope="row">
                    {{toggleDecOrHex(can_msgs[i].id)}}</td>
                  <td  v-bind:style="{color:colorStr( can_msgs[i].updatecount)}" > 
                    {{can_msgs[i].dlc}}</td>
                  <td  v-bind:style="{color:colorStr( can_msgs[i].updatecount)}" > 
                    {{can_msgs[i].cycle}}</td>
                  <td  v-for="index of 8"    v-bind:key="index"  v-bind:style="{color:colorStr( can_msgs[i].updatecount_data[index-1] )}">
                    {{  toggleDecOrHex( can_msgs[i].data[index-1] )}} </td>
                  <td> 
                    {{can_msgs[i].updatecount}}</td>


                  <!--
                  <td  v-for="youso_time in msg.updatecount_data">{{youso_time}}</td>
                  -->

              </tr>
              </tbody>

          </table>
         </v-col> 
         </v-row>
         </v-container> 


  </div>

  
</template>


<script>
//import ToggleButton from 'vue-js-toggle-button'
//import ToggleButton from './ToggleBtn.vue'
import ReconnectingWebSocket from 'reconnecting-websocket';
export default {

  beforeRouteLeave (to, from, next) {
    this.$destroy()
    next()
  },
 
  data() {
    return {
            selectItem: { name: "", mac: "" },
            can_dlc:0,
            can_msgs:[],
            can_msg:{ id:0, dlc:0, data:[0,0,0,0, 0,0,0,0], cycle:-1, updatetime:0, updatecount:-1, updatecount_data:[0,0,0,0, 0,0,0,0] },

            onrec_time:0,
                        
            timecnt:0,
                //{ id: 0, dlc: 8, msg: [0,1,2,3,4,5,6,7] },
            myStyle: 'RGB(10,0,200)',
            id_num:0,
            sort_direction_id: 1,
            sort_direction_dlc:1,
            sort_direction_time:1,
            sort_direction_str:["↑↓","↑↓","↑↓"],
            sort_target: -1,
            sort_target_str: ["ID","dlc","time"],
            
            sort_cnt:0,

            connect_status:-1,
            toggle_sort: false,
            toggle_rx_msg:false,
            toggle_hex:false,
            idfilter_val:"",
            idfilter_list:[],

            enable_rx_msg : true,

            lastInterval: 0,


    }
  },
  mounted() {
              setInterval(this.intervalFunc1000, 500);
              setInterval(this.intervalFunc3000, 3000);
              console.log("Starting connection to WebSocket Server")

              for(let i=0; i<0x7ff; i++){
                //this.exist_list[i] = -1;
                //this.id_list = 0;
                this.can_msg.id = -1;
                this.can_msgs[i] =  Object.assign( {}, this.can_msg );
              }
              
              this.websocketconnect();

        },
        computed: {

        },
        methods: {
          toggleDecOrHex:function( inputvar ){

            if(inputvar==null){
              return "";
            }

            if(inputvar==""){
              return "";
            }

            let val = Number(inputvar)
            if( this.toggle_hex ){
              return val.toString(16);
            }
            else{
              return val;
            }
          },

          colorStr:function( val ){
            var setVal = val*2;
            if( setVal > 10 ){setVal=10; }
            var setValHex = setVal.toString(16);

            return "#"+setValHex+setValHex+setValHex;

          },

          sortTargetStr:function(){
            if( this.sort_target >= 0 ){
              return this.sort_target_str[this.sort_target];

            }else{
              return "(未)";

            }

          },

          websocketconnect: function(){
              //this.connection = new WebSocket('ws://192.168.10.108:81/')

              this.connection  = new ReconnectingWebSocket(
                'ws://192.168.10.108:81/',
                null, 
                {
                  debug: false,
                  reconnectInterval: 3000
                }
              );              
              //this.connection = new WebSocket('ws://' + window.location.hostname + ':81/');
              this.connection.onmessage = (event) => {
                let e_time = new Date();
                if( e_time.getTime() - this.lastInterval > 2000 ){
                  this.enable_rx_msg = false;                  
                }else{
                  this.enable_rx_msg = true; 
                }

                if( this.enable_rx_msg && this.toggle_rx_msg ){
                  var get_msgs = JSON.parse(event.data)["canmsg"];
                  this.sortOutCanMsg( get_msgs ); 
                }

              }

              this.connection.onopen = function(event) {
                console.log(event)
                console.log("Successfully connected to the echo websocket server...")
              }

          },


            intervalFunc1000:function(){

              var temp_time = new Date();
              this.lastInterval = temp_time.getTime();

              
              this.connect_status = this.connection.readyState;
              if( this.connect_status !=1 ){
                //console.log(this.connect_status);
                // console.log("no connect, try connect");
                // this.websocketconnect();
              }

              this.timecnt = this.timecnt + 1;

              for( let i=0; i<this.id_num; i++){
                var e_time = new Date();
                var fromUpdateTime =  (e_time.getTime() - this.can_msgs[i].updatetime)/1000;
                if( fromUpdateTime > this.can_msgs[i].cycle ){
                  this.can_msgs[i].updatecount = fromUpdateTime;                  

                }
                for( let j=0; j<this.can_msgs[i].dlc; j++ ){
                    this.can_msgs[i].updatecount_data[j] = this.can_msgs[i].updatecount_data[j] +1;
                }
              }

            },

            intervalFunc3000:function(){
              if(this.toggle_sort){
                this.sortMsg( this.sort_target, 0 );
              }

            },
            sortOutCanMsg:function( getMsgs ){
              //console.log( getMsgs );
              //console.log( getMsgs[0].rxnum,  getMsgs.length );
              //console.log( getMsgs.length );              
              let idfilter_list_enable = false;
              for( let k=0; k<this.idfilter_list.length; k++){
                if( 0<this.idfilter_list[k] && this.idfilter_list[k]<0x800){
                  idfilter_list_enable = true;
                  break;
                }
              }

              for( let i=1; i<getMsgs.length; i++ ){
                if( idfilter_list_enable && !this.idfilter_list.includes( getMsgs[i].id ) ){
                  continue;
                }
                if( !(getMsgs[i].id > 0) ){
                  continue;
                }

                if( "data" in getMsgs[i]){

                  var exist_id = this.can_msgs.findIndex(msg => msg.id === getMsgs[i].id);
                  var e_time;
                  var temp_id;

                  if( exist_id == -1 ){ 
                    temp_id = this.id_num; 
                  }else{ 
                    temp_id = exist_id; 
                  }
                
                  e_time = new Date();
                  this.can_msgs[temp_id].id = getMsgs[i].id;
                  this.can_msgs[temp_id].dlc = getMsgs[i].dlc;
                  this.can_msgs[temp_id].cycle  =  getMsgs[i].cycle/1000;
                  this.can_msgs[temp_id].updatetime = e_time.getTime();
                  this.can_msgs[temp_id].updatecount = 0;                  

                  if( exist_id == -1 ){ // no exist
                    this.can_msgs[temp_id].updatecount_data = Object.assign( {}, this.can_msgs[this.id_num].updatecount_data );
                    this.id_num++;

                  }
                  else{ // exist 
                    for( let j=0; j<this.can_msgs[temp_id].dlc; j++ ){
                      if( this.can_msgs[temp_id].data[j] != getMsgs[i].data[j] ){
                        this.can_msgs[temp_id].updatecount_data[j] = 0;
                      }
                    }
                  }
                  this.can_msgs[temp_id].data = Object.assign( {}, getMsgs[i].data );
                  
                }
                else{ 
                  continue; 
                }

              }


            },
            sortFuncId: function( a,b ){
                  if (a.id < b.id) return -1 * this.sort_direction_id;
                  if (a.id > b.id) return  1 * this.sort_direction_id;
                  if (a.cycle+a.updatecount < b.cycle+b.updatecount) return -1 * this.sort_direction_time;
                  if (a.cycle+a.updatecount > b.cycle+b.updatecount) return  1 * this.sort_direction_time;
                  return 0;
            },
            sortFuncDlc: function( a,b ){
                  if (a.dlc < b.dlc) return -1 * this.sort_direction_dlc;
                  if (a.dlc > b.dlc) return  1 * this.sort_direction_dlc;
                  if (a.id < b.id) return   -1 * this.sort_direction_id;
                  if (a.id > b.id) return    1 * this.sort_direction_id;
                  return 0;
            },            
            sortFuncTime: function( a,b ){
                  if (a.cycle+a.updatecount < b.cycle+b.updatecount) return -1 * this.sort_direction_time;
                  if (a.cycle+a.updatecount > b.cycle+b.updatecount) return  1 * this.sort_direction_time;
                  if (a.id < b.id) return                 -1 * this.sort_direction_id;
                  if (a.id > b.id) return                  1 * this.sort_direction_id;
                  return 0;
            },

            sort_direction_strfunc: function( direction ){
              if( direction == -1 ) return "↓";
              else  return "↑";

            },

            sortMsg: function( sort_target, direct_change ){
              if( sort_target == -1 ) return;

              //console.log('sort');
              this.sort_cnt++;

              this.sort_direction_str = ["↑↓","↑↓","↑↓"];

              if( sort_target == 0 ){
                if( this.sort_target == 0 && direct_change == 1 ){ this.sort_direction_id *= -1; }
                var can_msgs_active    = this.can_msgs.slice( 0, this.id_num ).sort( this.sortFuncId );
                this.sort_direction_str[ sort_target ] = this.sort_direction_strfunc( this.sort_direction_id  );
                
              }
              else if( sort_target == 1 ){
                if( this.sort_target == 1 && direct_change == 1  ){ this.sort_direction_dlc *= -1; }
                can_msgs_active    = this.can_msgs.slice( 0, this.id_num ).sort( this.sortFuncDlc );
                this.sort_direction_str[ sort_target ] = this.sort_direction_strfunc( this.sort_direction_dlc  );

              }
              else {
                if( this.sort_target == 2 && direct_change == 1  ){ this.sort_direction_time *= -1; }
                can_msgs_active    = this.can_msgs.slice( 0, this.id_num ).sort( this.sortFuncTime );
                this.sort_direction_str[ sort_target ] = this.sort_direction_strfunc( this.sort_direction_time  );

              }
              this.sort_target = sort_target;

              for( let i=0; i<this.id_num; i++){
                this.can_msgs[i] = Object.assign( {}, can_msgs_active[i] );
              }
            },

            idFilterInput:function (input) {
              const ranges = input.split(',');
              const numbers = [];
              var numbers_ret = [];

              ranges.forEach(range => {
                const parts = range.trim().split('-').map(part => {
                  if (part.startsWith("0x")) {
                    return parseInt(part, 16);
                  } else {
                    return parseInt(part, 10);
                  }
                });
                if (parts.length === 1) {
                  numbers.push(parts[0]);
                } else {
                  const start = Math.min(parts[0], parts[1]);
                  const end = Math.max(parts[0], parts[1]);
                  for (let i = start; i <= end; i++) {
                    numbers.push(i);
                  }
                }
              });

              numbers_ret =  numbers.sort((a, b) => a - b);

              this.idfilter_list = numbers_ret;
              console.log(this.idfilter_list);

              this.idFilterRun();
              
            },

            idFilterRun:function () {

              var temp_enable_rx_msg = this.enable_rx_msg; //割り込み禁止�?な
              this.enable_rx_msg = false;
              let filter_cnt = 0;
              for( let i=0; i<this.id_num; i++ ){
                if( !this.idfilter_list.includes( this.can_msgs[i].id ) ){
                  this.can_msgs[i] =  Object.assign( {}, this.can_msg );  //初期�?
                  this.can_msgs[i].id = 2048;
                  filter_cnt = filter_cnt + 1;
                }
              }
                console.log(filter_cnt);              

              var temp_sort_direction_id = this.sort_direction_id;
              this.sort_direction_id = 1;
              this.sortMsg( 0, 0 ); //id で�?�?ソー�?
              this.sort_direction_id = temp_sort_direction_id; 
              this.id_num = this.id_num - filter_cnt;
              this.enable_rx_msg = temp_enable_rx_msg;


            }




        }
}
</script>

<style>
  .canrecv_table  {
    border: solid 1px #ccc;
    border-collapse:collapse;
    font-size: 8px;
    width: 100%;
    table-layout: fixed;
    word-break: break-all;
    word-wrap: break-all;

  }
  th {
    padding: 0.1px 10px;
    border: solid 1px #ccc;
    background-color: #eee;
  }
  td {
    padding: 1px;
    border: solid 1px #ccc;
    text-align: center;
  }

  .centered-input input {
    text-align: center
  }
  .right-input input {
    text-align: right;
  }

 
  @media only screen and (min-width:900px) {
    .canrecv_table  {
      font-size: 14px;
    }

  }  

  </style>


