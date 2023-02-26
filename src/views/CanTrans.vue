

<template>

  <v-container fluid>
    <v-row>
        <v-flex xs12  style="overflow-y: scroll; height: 55vh ">
        <!-- 上半分のコンテンツ -->
        <v-data-table
            v-model="select_row_data"
            :headers="headers"
            :items="tx_msgs"
            :items-per-page="-1"
            hide-default-footer
            @click:row="onClickSelectRow"
            class="elevation-1"
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
                inset
                small   
            ></v-switch>
        </template>

        <template v-slot:[`item.trans`]>
            <v-switch></v-switch>
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
        <v-row  align-content="center">
            <v-col cols="12" sm="6" md="1">
                <v-btn
                    color="primary"
                    dark
                    class="mb-2"
                    small
                    :disabled="now_edit"
                    @click="new_msg">
                    +Msg
                </v-btn>
            </v-col>            
            <v-col cols="12" sm="6" md="1">
                <v-text-field
                    v-model="inputCanId[0]"
                    label="id"
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
                <v-card @click="editDataClick(n-1)" :color="editDataColor[n-1]" >
                    <v-card-text  class="text-right">
                      {{editData.data[n-1]}}
                      <br>
                      0x {{editData.data[n-1].toString(16)}}
                    </v-card-text>

                </v-card>
            </v-col> 
        </v-row>
        <v-row>
        <v-col  cols="3">
            <v-radio-group row v-model.number="inputPhysData_type" >
            <v-radio label="Intel"    :value=0></v-radio>
            <v-radio label="Motorola"  :value=1></v-radio>
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
              label=""
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

  export default {
    // components: {
    //   VueNumericInput
    // },    
    data: () => ({
      dialog: false,
      dialogDelete: false,
      headers: [
        { text: 'Edit',  value: 'edit_select'},
        { text: 'ID',    value: 'canid' },
        { text: 'dlc',   value: 'dlc' },
        { text: 'cycle', value: 'cycle' },
        { text: 'data0', value: 'data.0' },
        { text: 'data1', value: 'data.1' },
        { text: 'data2', value: 'data.2' },
        { text: 'data3', value: 'data.3' },
        { text: 'data4', value: 'data.4' },
        { text: 'data5', value: 'data.5' },
        { text: 'data6', value: 'data.6' },
        { text: 'data7', value: 'data.7' },
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
        { edit_select:false, canid:0, dlc:3, cycle:100, data:[0,1,2,3,4,5,6,7] },
        { edit_select:false, canid:1, dlc:4, cycle:101, data:[10,1,2,4,4,5,6,7] },
        { edit_select:false, canid:2, dlc:5, cycle:102, data:[20,1,2,5,4,5,6,7] },
        { edit_select:false, canid:3, dlc:6, cycle:103, data:[30,1,2,6,4,5,6,7] },
      ],
      tx_msg_init:{ edit_select:false, canid:2048, dlc:1, cycle:1000, data:[0,0,0,0, 0,0,0,0] },
      now_edit:false,
      editedIndex: -1,
      editBtnStr:["New Msg","Check Msg"],

      editData: {
        canid: "2048",
        dlc: "8",
        cycle: "1000",
        data: [0,0,0,0, 0,0,0,0],
      },
      editDataTemp: {
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
      
      inputPhysData_type: 1, // 0:hex, 1:dec, 2:dec&gain&factor
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
    },

    methods: {
        initialize () {
          this.inputCanId[0] = this.editData.canid;
          this.inputCycle[0] = this.editData.cycle;

        },
        onClickSelectRow() {

        },
        editBtnOn(item, index){
            this.editData = item;
            for( let i=0; i<this.tx_msgs.length; i++ ){
                if( i!= index){
                    this.tx_msgs[i].edit_select = false;
                }
            }
            this.inputCanId[0] = this.editData.canid
            this.inputCycle[0] = this.editData.cycle


            this.now_edit = item.edit_select 
            console.log(item );

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
            this.dialogDelete = true
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
          for( let i=0; i<8; i++ ){
            tempmsg.data[i] = this.editData.data[i]
          }
          this.tx_msgs.unshift( tempmsg )

        },

        editDataClick( index ) {
          this.editDataClick_select( index )
          this.editDataClick_input()          
          this.inputLogiData_val[0] = this.editData_selected_val
          this.inputLogiData_hex = this.dec2hex_0x_string( this.inputLogiData_val[0] )
          this.inputPhysData_val[0] = this.input_logical2pysical( this.editData_selected_val )
          this.inputPhysData_calc()

        },

        editDataClick_select( index ) {
            this.editDataSelect[ index ] = !this.editDataSelect[ index ] // reverse T/F

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

            //色を変える
            for( let i=0; i<8; i++ ){
              if (  this.editDataSelect[ i ]  == false){
                this.editDataColor[ i ] = 'white'
              }
              else{
                this.editDataColor[ i ] = '#ccf'
              }
            }
            this.editDataColor.splice();

        },
        editDataClick_input() {
          var cnt = 0
          var retval = 0;
          for( let i=0; i<8; i++ ){
            if( this.editDataSelect[ i ] == true ){
              retval += ( this.editData.data[i] << (8*cnt) )
              cnt++
            }
          }
          this.editData_selected_val = retval
          
        },
        inputPhysData_calc(){
          for( let i=0; i<8; i++ ){
            if( this.editDataSelect == true ){
              //this.inputPhysData_val[0] = this.input_logical2pysical( this.inputLogiData_val[0] )
//              this.inputPhysData_val[0] = this.input_logical2pysical( this.editData_selected_val )
            }
          }
          
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
          var k = 0
          for( let i=0; i<8; i++ ){
            k = i
            if( this.editDataSelect[k] == true ){
              this.editData.data[k] = ( val >> (cnt*8) ) & 0xff
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

    },
  }
</script>



<style>
      .center-input input {
        text-align: center;
      }
      .text-right {
        text-align: right;
        }      
</style>