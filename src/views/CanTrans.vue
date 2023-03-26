

<template>

  <v-container fluid  no-gutters dense   pa-0 ma-0  >
 
    <v-row  no-gutters dense   pa-10 ma-10 >
        <v-col cols="1" @click="save_tx_msg" >
          <v-icon
          @click.stop="save_tx_msg"
            >
            mdi-content-save
          </v-icon> 
          save
        </v-col>              
        <v-col cols="1"  @click="load_tx_msg" >
          <v-icon
              @click.stop="load_tx_msg"
            >
            mdi-download-multiple
            </v-icon> load
        </v-col>              
        <v-col cols="1"  >
          <v-spacer />
        </v-col>
        <v-col cols="1"  >
          <v-switch class="ma-0 pa-0" label="hex(0x**)" dense v-model="tx_msg_show_hex" :style="{padding: 0}"  />
        </v-col>
        <v-col cols="5"  >
          <v-spacer />
        </v-col>
        <v-col cols="2"  >
          <v-switch class="ma-0 pa-0" label="CAN送信" dense v-model="runTrans_flag" :style="{padding: 0}" />
        </v-col>
        <v-col cols="1">
          <v-switch class="ma-0 pa-0" label="DelConfirm" dense v-model="delConfirm_flag"   :style="{padding: 0}" />
        </v-col>

        <v-flex xs12  style="overflow-y: scroll; height: 50vh ">
        <!-- 上半分のコンテンツ -->
        <v-data-table
            v-model="select_row_data"
            :headers="headers"
            height="50vh"
            fixed-header
            :items="tx_msgs"
            :items-per-page="-1"
            hide-default-footer
            class="cantrans_table"
            dense
  
        >
        <!-- sort-by="id" -->
        <!--  -->

      <template v-slot:top>
        <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="text-h5">削除しますか?</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>        
      </template>

        <!-- <template v-slot:[`item.edit_select`]="{ item, index }"> -->
        <template v-slot:[`item.edit_select`]="{ item, index }">
            <v-switch
            @click="editBtnOn(item, index)"                   
                v-model="item.edit_select"
                small   
            ></v-switch>
        </template>

        <template v-slot:[`item.trans`]="{ item, index }">
            <v-switch
              @click="transBtnOn(item, index)"                   
                v-model="item.trans"
                small              
            ></v-switch>
        </template>

        <template v-slot:[`item.canid`]="{ item }">
          {{ toShowHexId(item.canid) }} 
        </template>

        <template v-for="index in [0,1,2,3,4,5,6,7]" v-slot:[`item.data.${index}`]="{ item }">
          {{ toShowHexData(item, index) }} 
        </template>

        <template v-slot:[`item.delete`]="{ item  }">
            <v-icon
              small
              @click="deleteItem(item)"
            >
            mdi-delete
            </v-icon>
        </template>

       </v-data-table>

      </v-flex>


      <v-flex xs12 style="height: 20vh; width: 100%; margin: 2%; ">
        <!-- 下半分のコンテンツ -->
        <v-row  align-content="center" >
            <v-col cols="12" sm="6" md="1">
                <v-btn
                    color="primary"
                    dark
                    class="mt-3"
                    small
                    :disabled="now_edit"
                    @click="new_msg">
                    +Msg
                </v-btn>
            </v-col>            
            <v-col cols="12" sm="6" md="1">
                <v-text-field
                    v-model="inputCanId[0]"
                    :label= "toShowHexEditId(inputCanId[0])"
                    @click="numberEdit_start( inputCanId )"
                    @change="numberEdit_update( inputCanId );
                                       editCanIdCycle_update()"
                    
                ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="1">
                <v-select
                    v-model="editData.dlc"
                    :items="select_dlc_items"
                    label="dlc"

                ></v-select>
            </v-col>
            <v-col cols="12" sm="6" md="1">
                <v-text-field
                    v-model="inputCycle[0]"
                    label="cycle"
                    @click="numberEdit_start( inputCycle )"
                    @change="numberEdit_update( inputCycle );
                                      editCanIdCycle_update()"

                ></v-text-field>
            </v-col>
            <v-col v-for="n in 8" :key="n" cols="12" md="1">
                <v-card   @click="editDataClick(n-1, true)" :color="editDataClick_selectColor(n-1)" >
                    <v-card-text  class="text-right  py-1" >
                      {{editData.data[n-1]}}
                      <br>
                      0x {{editData.data[n-1].toString(16)}}
                    </v-card-text>

                </v-card>
            </v-col> 
        </v-row>

        <v-row class="ma-0 pa-0"  >
        <v-col  cols="3">
            <v-radio-group row v-model.number="endian_type" @change="endian_select" >
            <v-radio label="Intel"    @change="endian_select" :value=0></v-radio>
            <v-radio label="Motorola"  @change="endian_select"  :value=1></v-radio>
            <!-- <v-radio label=" 2進"  value="radio-3"></v-radio> -->
            </v-radio-group>
        </v-col>
        <v-col  cols="1">
          <v-text-field
              label="Factor"
              v-model="inputPhysData_factor[0]"
              @click="numberEdit_start( inputPhysData_factor )"
              @change="numberEdit_update( inputPhysData_factor );
                                inputPhysData_changeFactorOffset()"
          ></v-text-field>
          <!-- @change="inputPhysData_changeFactorOffset" -->

         </v-col>
         <v-col  cols="1">
          <v-text-field
              label="Offset"
              v-model="inputPhysData_offset[0]"
              @click="numberEdit_start( inputPhysData_offset )"
              @change="numberEdit_update( inputPhysData_offset );
                                 inputPhysData_changeFactorOffset()"
          ></v-text-field>                    
          </v-col> 
          <v-col  cols="1">
          <v-text-field
              label="Step"
              v-model="inputPhysData_step[0]"
              @click="numberEdit_start( inputPhysData_step )"
              @change="numberEdit_update( inputPhysData_step );
                                 inputPhysData_calc()"
          ></v-text-field>                    
          <!-- @change="inputPhysData_calc" -->
          </v-col>           
          <v-col  cols="3">
            <!-- <vue-numeric-input  v-model="value" :min="1" :max="10" :step="2"></vue-numeric-input> -->
            <v-text-field
              label="物理値 ( 論理値 × Factor + Offset )"
              class="center-input"
              v-model.number="inputPhysData_val[0]"
              @change="inputPhysData_calc"
              > 
              <template v-slot:append>
                <v-btn color="gray" x-small @click="inputPhysData_StepBtnClick(0)">
                  <v-icon> mdi-plus</v-icon>
                </v-btn>
              </template>

              <template v-slot:prepend-inner>
                <v-btn color="gray" x-small @click="inputPhysData_StepBtnClick(1)">
                  <v-icon> mdi-minus</v-icon>
                </v-btn>
              </template>                 
            </v-text-field>
          </v-col> 

          <v-col  cols="1">
          <v-text-field
              label="論理値"
              v-model="inputLogiData_val[0]"
              @click="numberEdit_start( inputLogiData_val )"
              @change="numberEdit_update( inputLogiData_val ); inputLogiData_calc()"
          ></v-text-field>
          <!-- @change="inputLogiData_calc" -->
         </v-col>
         <v-col  cols="1">
          <v-text-field
              label="論理値(hex)"
              v-model="inputLogiData_hex"
              readonly 
          ></v-text-field>
         </v-col>
         

        </v-row>

        
      </v-flex>
    </v-row>
  </v-container>
  </template>


<script>

// import VueNumericInput from 'vue-numeric-input'
import axios from 'axios';

  export default {
    // components: {
    //   VueNumericInput
    // },    
    data: () => ({
      postheaders: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
      },
      dialog: false,
      dialogDelete: false,
      headers: [
        { text: 'Edit',  value: 'edit_select'},
        { text: 'ID',    value: 'canid' },
        { text: 'dlc',   value: 'dlc' },
        { text: 'cycle', value: 'cycle' },
        { text: 'data0', align: 'right', value: 'data.0' },
        { text: 'data1', align: 'right', value: 'data.1' },
        { text: 'data2', align: 'right', value: 'data.2' },
        { text: 'data3', align: 'right', value: 'data.3' },
        { text: 'data4', align: 'right', value: 'data.4' },
        { text: 'data5', align: 'right', value: 'data.5' },
        { text: 'data6', align: 'right', value: 'data.6' },
        { text: 'data7', align: 'right', value: 'data.7' },
        { text: 'transmit',  value: 'trans'},
        { text: '',  value: 'delete'},
      ],
    //   tx_msgs: [],
      temp_items:[0,1,2,3,4,5,6,7],
      select_dlc_items:[1,2,3,4,5,6,7,8],
      select_dlc:0,
      select_row_single:true,
      select_row_data:[],
      edit_index:-1,
      tx_msgs:[
        { edit_select:false, canid:10, dlc:3, cycle:100, data:[10,1,2,4,4,5,6,7],  trans:0 },
        // { edit_select:false, canid:1, dlc:4, cycle:101, data:[10,1,2,4,4,5,6,8],  trans:0 },
        // { edit_select:false, canid:2, dlc:5, cycle:102, data:[20,1,2,5,4,5,6,9],  trans:0 },
        // { edit_select:false, canid:3, dlc:6, cycle:103, data:[30,1,2,6,4,5,6,71], trans:0 },
      ],
      tx_msg_init:{ edit_select:false, canid:2048, dlc:8, cycle:1000, data:[0,0,0,0, 0,0,0,0] },
      tx_msg_show_hex: false,
      runTrans_flag:false,
      delConfirm_flag:true,
      now_edit:false,
      editedIndex: -1,
      editBtnStr:["New Msg","Check Msg"],

      editData: {
        canid: 2048,
        dlc: 8,
        cycle: 1000,
        data: [0,0,0,0, 0,0,0,0],
      },
      editDataNoLink: {
        canid: "-",
        dlc: "-",
        cycle: "-",
        data: [0,0,0,0, 0,0,0,0],
      },
      editData_dlc:-1,  
      editDataColor: ['white','white','white','white','white','white','white','white'],
      editDataSelect: [false,false,false,false,false,false,false,false],
      editData_selected_val:0,

      inputCanId:[ 0, 0 ],
      inputCycle:[ 0, 0 ],
      
      endian_type: 1, // 0:hex, 1:dec, 2:dec&gain&factor
      inputPhysData_factor:[1,1],
      inputPhysData_offset:[0,0],
      inputPhysData_step: [1 , 0],
      inputPhysData_val : [0, 0],
      OutputData : 0,
      inputLogiData_val:[0, 0],
      inputLogiData_hex:0,


    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
      },
    },

    watch: {
      dialog (val) {
        val || this.close()
      },
      dialogDelete (val) {
        val || this.closeDelete()
      },
    },

    created () {
      this.initialize()
      setInterval(this.intervalFunc1000, 1000);

    },

    methods: {
        initialize () {
          this.inputCanId[0] = this.editData.canid;
          this.inputCycle[0] = this.editData.cycle;

        },        
        transBtnOn(item, index){
          if( item.trans == true ){
            this.tx_msgs[index].trans = 1
          }else{
            this.tx_msgs[index].trans = 0
          }
        
        },
        editBtnOn(item, index){

          for( let i=0; i<8; i++){
            if( item.dlc <= i ){
              item.data[i] = 0;
            }
          }

          if( item.edit_select  == true ){
            this.editData = item;

            for( let i=0; i<this.tx_msgs.length; i++ ){
                if( i!= index){
                    this.tx_msgs[i].edit_select = false;
                }
            }
            this.inputCanId[0] = this.editData.canid
            this.inputCycle[0] = this.editData.cycle
            for( let i=0; i<8; i++){
              this.editDataSelect[i] = false
            }
            this.editDataSelect.splice();

          }else{
            this.editData = this.editDataNoLink;
            this.editData.canid = item.canid
            this.editData.dlc = item.dlc
            this.editData.cycle = item.cycle
            for( let i=0; i<8; i++){
              this.editDataSelect[i] = false
              this.editData.data[i] = item.data[i]
            }

          }
          this.editData.data.splice();
          this.now_edit = item.edit_select 

        },

        editCanIdCycle_update( ){
          this.editData.canid = this.inputCanId[0];
          this.editData.cycle = this.inputCycle[0];
        },

        editItem (item) { 
        this.editedIndex = this.tx_msgs.indexOf(item)
        this.editedItem = Object.assign({}, item)
       
        this.dialog = true
        },

        deleteItem (item) {
            this.editedIndex = this.tx_msgs.indexOf(item)
            this.editedItem = Object.assign({}, item)
            console.log(this.editedIndex )   
            if( this.delConfirm_flag ){
              this.dialogDelete = true
            }else{
              this.deleteItemConfirm() 
            }
        },

        deleteItemConfirm () {
            this.tx_msgs.splice(this.editedIndex, 1)
            this.closeDelete()
        },

        close () {
        this.dialog = false
        this.$nextTick(() => {
            this.editedItem = Object.assign({}, this.defaultItem)
            this.editedIndex = -1
        })
        },

        closeDelete () {
        this.dialogDelete = false
        this.$nextTick(() => {
            this.editedItem = Object.assign({}, this.defaultItem)
            this.editedIndex = -1
        })
        },

        save () {
            if (this.editedIndex > -1) {
                Object.assign(this.tx_msgs[this.editedIndex], this.editedItem)
            } else {
                this.tx_msgs.push(this.editedItem)
            }
            this.close()
        },

        new_msg(){

          let tempmsg = Object.assign({}, this.tx_msg_init)

          if( Number.isInteger(this.editData.canid)  ){
            tempmsg.canid = this.editData.canid
          }
          if( Number.isInteger(this.editData.dlc)  ){
            tempmsg.dlc   = this.editData.dlc
          }
          if( Number.isInteger(this.editData.cycle)  ){
            tempmsg.cycle = this.editData.cycle
          }
          // for( let i=0; i<8; i++ ){
          //   tempmsg.data[i] = this.editData.data[i]
          // }
          tempmsg.data = this.editData.data.slice()
          //tempmsg.data = Object.assign({}, this.editData.data)
          this.tx_msgs.unshift( tempmsg )

        },

        editDataClick( index, isToggle ) {
          this.editDataClick_select( index, isToggle )
          this.editDataClick_input()          
          this.inputLogiData_val[0] = this.editData_selected_val
          this.inputLogiData_hex = this.dec2hex_0x_string( this.inputLogiData_val[0] )
          this.inputPhysData_val[0] = this.input_logical2pysical( this.editData_selected_val )
          this.inputPhysData_calc()

        },

        editDataClick_select( index, isToggle ) {
            if( isToggle == true ){
              this.editDataSelect[ index ] = !this.editDataSelect[ index ] // reverse T/F
            }

            //クリックしたところから隣り合うTrueはそのまま、飛び石になっているところはFlase
            var false_flag = 0
            //trueになった場合
            if( this.editDataSelect[ index ] == true ){
              false_flag = 0; 
              for( let i=index; i<8; i++ ){
                if( this.editDataSelect[ i ] == false ){
                  false_flag = 1
                }
                if( false_flag == 1 ){
                  this.editDataSelect[ i ] = false
                }
              }
              false_flag = 0; 
              for( let i=index; i>=0; i-- ){
                if( this.editDataSelect[ i ] == false ){
                  false_flag = 1
                }
                if( false_flag == 1 ){
                  this.editDataSelect[ i ] = false
                }
              }
            }

            //falseになった場合
            if( this.editDataSelect[ index ] == false ){              
              if( this.editDataSelect[ index -1 ] == true && this.editDataSelect[ index +1 ] == true ) {
                for( let i=0; i<8; i++ ){
                  this.editDataSelect[ i ] = false
                }
              }
            }
          
        },
        // //色を変える
        editDataClick_selectColor(i){
          if (  this.editDataSelect[ i ]  == false){
            return 'white'
          }else{
            return '#ccf'

          }
        },

        editDataClick_input() {
          var cnt = 0
          var retval = 0;
          var i;
          for( let k=0; k<8; k++ ){
            if( this.endian_type == 0 ){
              i = k
            } else{
              i = 7-k
            }
            if( this.editDataSelect[ i ] == true ){
              retval += ( this.editData.data[i] << (8*cnt) )
              cnt++
            }
          }
          this.editData_selected_val = retval
          
        },
        inputPhysData_calc(){          
          this.inputLogiData_val[0] = this.input_pysical2logical( this.inputPhysData_val[0]  ) // ( Number( this.inputPhysData_val[0] ) + Number( this.inputPhysData_offset[0] ) ) / Number( this.inputPhysData_factor[0] )
          this.inputLogiData_hex = this.dec2hex_0x_string( this.inputLogiData_val[0] )
          this.editDataUpdate( this.inputLogiData_val[0] )

        },
        inputLogiData_calc(){
          this.inputPhysData_val[0] =  this.input_logical2pysical( this.inputLogiData_val[0] ) 
          this.inputLogiData_hex = this.dec2hex_0x_string( this.inputLogiData_val[0] )
          this.editDataUpdate( this.inputLogiData_val[0] )

        },
        editDataUpdate( val ){
          var cnt = 0
          var i = 0
          for( let k=0; k<8; k++ ){
            if( this.endian_type == 0 ){
              i = k
            } else{
              i = 7-k
            }
            if( this.editDataSelect[i] == true ){
              this.editData.data[i] = ( val >> (cnt*8) ) & 0xff
              cnt++
            }
          }
        },


        input_pysical2logical( pysval ){
          return Math.floor( ( Number( pysval ) - Number( this.inputPhysData_offset[0] ) ) / Number( this.inputPhysData_factor[0] ) )
        },
        input_logical2pysical( logival ){
          return  Number( logival ) * Number( this.inputPhysData_factor[0] ) + Number( this.inputPhysData_offset[0] )   //( Number( pysval ) + Number( this.inputPhysData_offset[0] ) ) / Number( this.inputPhysData_factor[0] )
        },

        inputPhysData_StepBtnClick( plusminus ) {
          if( plusminus == 0 ){
            this.inputPhysData_val[0] += Number( this.inputPhysData_step[0] )
          }else{
            this.inputPhysData_val[0] -= Number( this.inputPhysData_step[0] )
          }
          this.inputPhysData_val[0] =  Number( this.inputPhysData_val[0].toFixed(5) )
          this.inputPhysData_val.splice()
          this.inputPhysData_calc()
        },

        inputPhysData_changeFactorOffset(){
          this.inputPhysData_val[0] = this.inputLogiData_val[0] * this.inputPhysData_factor[0] + this.inputPhysData_offset[0]
          //this.inputPhysData_step = this.inputPhysData_factor[0] * this.inputPhysData_step

        },

        dec2hex_0x_string( decval ){
          return '0x' + decval.toString(16)

        },

        numberEdit_start( arr_val ){ //arr_val:[ mainnum, savenum ]
          arr_val[1] = arr_val[0]
        },
        numberEdit_update( arr_val ){
          let arr0_nan = false

          if( !this.isString(arr_val[0]) ){
            arr_val[0] = arr_val[0].toString();
          }

          if( (arr_val[0]).indexOf('.') !== -1 ){
            if(  isNaN( parseFloat( arr_val[0] ) ) ){
              arr0_nan = true
            }else{
              arr_val[0] = parseFloat( arr_val[0] )
            }
          }else{
            if(  isNaN( parseInt( arr_val[0] ) ) ){
              arr0_nan = true
            }else{
              arr_val[0] = parseInt( arr_val[0] )              
            }
          }

          if( arr0_nan ){
            arr_val[0] = arr_val[1]
          }

          arr_val.splice()

        },
        isString(value) {
          if (typeof value === "string" || value instanceof String) {
            return true;
          } else {
            return false;
          }
        },
        toShowHexId( _canid ) {
          if( this.tx_msg_show_hex ){
            return _canid.toString(16);
          } else{
            return _canid.toString(10);
          }
        },
        toShowHexEditId( _canid0 ) {
          var _canid
          if( this.isString(_canid0) ){
            _canid =  parseInt( _canid0 )
          }else{
            _canid =  _canid0 

          }

          return  "ID: 0x" + _canid.toString(16);

        },        
        toShowHexData( item, index ) {
          if( item.dlc <= index ){
            return ""
          }
          if( this.tx_msg_show_hex ){
            return item.data[index].toString(16);
          } else{
            return item.data[index].toString(10);
          }
        },
        endian_select(){
          this.editDataClick_input()          
          this.inputLogiData_val[0] = this.editData_selected_val
          this.inputLogiData_hex = this.dec2hex_0x_string( this.inputLogiData_val[0] )
          this.inputPhysData_val[0] = this.input_logical2pysical( this.editData_selected_val )
          console.log("test")
        },
        async sendData() {
            //const dat = [{ id: 100, cycle: 100, data: [0, 1, 2, 3, 4,5,6,7] }];
            //console.log(this.tx_msgs);
            await axios
              .post('http://192.168.10.108/post', this.tx_msgs)
              .then((res) => {                
                console.log(res);
                this.posts = res.data.posts;
              })
              .catch((err) => {
                console.log(err);
              });
           
        },

        save_tx_msg(){
          let ret = confirm("変数の保存をしますか？");
          if( ret==false ) return ;
          let save_tx_msgs;
          save_tx_msgs = this.tx_msgs;
          // for(let i=0; i<save_tx_msgs.length; i++){
          //   save_tx_msgs[i].edit_select = false;
          //   save_tx_msgs[i].trans = 0;
          // }

          let tx_msgs_json = JSON.stringify( save_tx_msgs, undefined, 1);
          localStorage.setItem( "tx_msgs", tx_msgs_json);
          console.log(save_tx_msgs);
        },
        load_tx_msg(){
          let ret = confirm("変数のロードをしますか？");
          if( ret==false ) return ;
          // this.tx_msgs = localStorage.getItem("tx_msgs");
          // console.log(this.tx_msgs);
          let tx_msgs_json = localStorage.getItem('tx_msgs');
          this.tx_msgs = JSON.parse(tx_msgs_json);
          for(let i=0; i<this.tx_msgs.length; i++){
            this.tx_msgs[i].edit_select = false;
            this.tx_msgs[i].trans = 0;
          }
          this.now_edit = false

          console.log( this.tx_msgs );

          //console.log(localStorage.getItem("tx_msgs"));
        },

        intervalFunc1000(){
          if( this.runTrans_flag ){
            this.sendData() 
            console.log( this.tx_msgs );
          }

        }



    },
  }
</script>



<style>

      .cantrans_table td:nth-child(4),
      .cantrans_table th:nth-child(4), 
      .cantrans_table td:nth-child(12),
      .cantrans_table th:nth-child(12)       
      {
        border-right: 2px solid #ccc;
      }      
      .center-input input {
        text-align: center;
      }
      .text-right {
        text-align: right;
      }      
</style>