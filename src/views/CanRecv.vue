<template>
  <div class="about">
        {{timecnt}} {{connect_status}}
          <table class="table table-hover" aria-describedby="listhelp">
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
                <tr v-for="n in id_num"  v-bind:key="n" >
                  <td  v-bind:style="{color:colorStr( can_msgs[n].updatecount)}" scope="row">{{can_msgs[n].id}}</td>
                  <td  v-bind:style="{color:colorStr( can_msgs[n].updatecount)}" > {{can_msgs[n].dlc}}</td>
                  <td  v-bind:style="{color:colorStr( can_msgs[n].updatecount)}" > {{can_msgs[n].cycle}}</td>
                  <td  v-for="index of 8"    v-bind:key="index"  v-bind:style="{color:colorStr( can_msgs[n].updatecount_data[index-1] )}">{{can_msgs[n].data[index-1]}}</td>
                  <td> {{can_msgs[n].updatecount}}</td>


                  <!--
                  <td  v-for="youso_time in msg.updatecount_data">{{youso_time}}</td>
                  -->

              </tr>
              </tbody>

          </table>


  </div>
</template>


<script>
export default {
  data() {
    return {
            selectItem: { name: "", mac: "" },
            can_dlc:0,
            can_msgs:[],
            can_msg:{ id:0, dlc:0, data:[0,0,0,0, 0,0,0,0], cycle:-1, updatetime:0, updatecount:-1, updatecount_data:[0,0,0,0, 0,0,0,0] },

            onrec_time:0,
                        
            can_msgs_sort:[],
            can_id_array:[],
            timecnt:0,
                //{ id: 0, dlc: 8, msg: [0,1,2,3,4,5,6,7] },
            myStyle: 'RGB(10,0,200)',
            exist_list:[],
            id_list:[],
            id_list_num:0,
            id_num:0,
            sort_direction_id: 1,
            sort_direction_dlc:1,
            sort_direction_time:1,
            sort_direction_str:["↑↓","↑↓","↑↓"],
            sort_target: -1,
            sort_cnt:0,

            connect_status:-1


    }
  },
mounted() {
              setInterval(this.intervalFunc1000, 500);
              setInterval(this.intervalFunc3000, 3000);
              console.log("Starting connection to WebSocket Server")

              for(let i=0; i<0x7ff; i++){
                this.exist_list[i] = -1;
                //this.id_list = 0;
                this.can_msg.id = -1;
                this.can_msgs[i] =  Object.assign( {}, this.can_msg );
              }
              
              this.websocketconnect();

              // this.connection = new WebSocket('ws://192.168.10.108:81/')
              // //this.connection = new WebSocket('ws://' + window.location.hostname + ':81/');
              // this.connection.onmessage = (event) => {
              //   console.log(event.data);
              //   //var temptime = new Date();
              //   //console.log( temptime.getTime() - this.onrec_time);
              //   //this.onrec_time = temptime.getTime();
              //   get_msgs = JSON.parse(event.data)["canmsg"];
              //   this.sortOutCanMsg( get_msgs ); 

              // }

              // this.connection.onopen = function(event) {
              //   console.log(event)
              //   console.log("Successfully connected to the echo websocket server...")
              // }


        },
        computed: {

        },
        methods: {
          colorStr:function( val ){
            var setVal = val*2;
            if( setVal > 10 ){setVal=10; }
            var setValHex = setVal.toString(16);

            return "#"+setValHex+setValHex+setValHex;

          },

          websocketconnect: function(){
              this.connection = new WebSocket('ws://192.168.10.108:81/')
              //this.connection = new WebSocket('ws://' + window.location.hostname + ':81/');
              this.connection.onmessage = (event) => {
                //console.log(event.data);
                //var temptime = new Date();
                //console.log( temptime.getTime() - this.onrec_time);
                //this.onrec_time = temptime.getTime();
                var get_msgs = JSON.parse(event.data)["canmsg"];
                this.sortOutCanMsg( get_msgs ); 

              }

              this.connection.onopen = function(event) {
                console.log(event)
                console.log("Successfully connected to the echo websocket server...")
              }

          },


            intervalFunc1000:function(){
              this.connect_status = this.connection.readyState;
              if( this.connect_status !=1 ){
                //console.log("no connect, try connect");
                //this.websocketconnect();
              }

              this.timecnt = this.timecnt + 1;

              for( let i=0; i<this.id_num; i++){
                var e_time = new Date();
                var fromUpdateTime =  (e_time.getTime() - this.can_msgs[i].updatetime)/1000;
                if( fromUpdateTime > this.can_msgs[i].cycle ){
                  //if( e_time.getTime() - this.can_msgs[i].updatetime >= 1000 ){
                  //this.can_msgs[i].updatecount = this.can_msgs[i].updatecount + 1;
                  this.can_msgs[i].updatecount = fromUpdateTime;                  

                }
                for( let j=0; j<this.can_msgs[i].dlc; j++ ){
                    this.can_msgs[i].updatecount_data[j] = this.can_msgs[i].updatecount_data[j] +1;
                }

              }

            },

            intervalFunc3000:function(){
              this.sortMsg( this.sort_target, 0 );

            },
            sortOutCanMsg:function( getMsgs ){
              //console.log( getMsgs );
              console.log( getMsgs[0].rxnum,  getMsgs.length );
              //console.log( getMsgs.length );


              for( let i=1; i<getMsgs.length; i++ ){
                // //exist_id = this.can_id_array.indexOf( getMsgs[i].id);
                // if( i== getMsgs.length-1 ){
                //   if( "last" in getMsgs[i] ){
                //     return getMsgs[i].last;
                //   }else{
                //     return -1;
                //   }
                // }
                if( "data" in getMsgs[i]){
                  var exist_id = this.can_msgs.findIndex(msg => msg.id === getMsgs[i].id);
                  var e_time;
                  if( exist_id == -1 ){ // no exist
                    this.can_msgs[this.id_num].id = getMsgs[i].id;
                    this.can_msgs[this.id_num].dlc = getMsgs[i].dlc;

                    this.can_msgs[this.id_num].cycle  =  getMsgs[i].cycle/1000;
                    e_time = new Date();
                    this.can_msgs[this.id_num].updatetime = e_time.getTime();
                    this.can_msgs[this.id_num].updatecount = 0;

                    //for( let k=0; k<getMsgs[i].dlc; k++ ){
                    this.can_msgs[this.id_num].data = Object.assign( {}, getMsgs[i].data );
                    //}               

                    this.can_msgs[this.id_num].updatecount_data = Object.assign( {}, this.can_msgs[this.id_num].updatecount_data );

                    this.id_num++;
                    this.can_msgs_sort = this.can_msgs;
                    this.exist_list[getMsgs[i].id] = getMsgs[i].id;
                    this.id_list.push(getMsgs[i].id);

                  }
                  else{ // exist 

                    this.can_msgs[exist_id].id = getMsgs[i].id;
                    this.can_msgs[exist_id].dlc = getMsgs[i].dlc;
                    this.can_msgs[exist_id].cycle  = getMsgs[i].cycle/1000; 
                    e_time = new Date();
                    this.can_msgs[exist_id].updatetime = e_time.getTime();
                    this.can_msgs[exist_id].updatecount = 0;

                    for( let j=0; j<this.can_msgs[exist_id].dlc; j++ ){
                      if( this.can_msgs[exist_id].data[j] != getMsgs[i].data[j] ){
                        this.can_msgs[exist_id].updatecount_data[j] = 0;
                      }
                    }
                    this.can_msgs[exist_id].data = Object.assign( {}, getMsgs[i].data );


                    


                  }                  
                }
                else{ 
                  continue; 
                }

                // if( getMsgs[i].id < 100){}
                // else{ continue; }


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

            // sortMsg_id: function(){
            //   if( this.sort_target == 0 ){ this.sort_direction_id *= -1; }
            //   this.sort_target = 0;
            //   this.sortMsg( this.sort_target );
            // },
            // sortMsg_dlc: function(){
            //   if( this.sort_target == 1 ){ this.sort_direction_dlc *= -1; }
            //   this.sort_target = 1;
            //   this.sortMsg( this.sort_target );
            // },
            // sortMsg_time: function(){
            //   if( this.sort_target == 2 ){ this.sort_direction_time *= -1; }
            //   this.sort_target = 2;
            //   this.sortMsg( this.sort_target );
            // },

            sortMsg: function( sort_target, direct_change ){
              if( sort_target == -1 ) return;

              console.log('sort');
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


        }
}
</script>

<style>
  table {
    border: solid 1px #ccc;
    border-collapse:collapse;
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
  </style>


