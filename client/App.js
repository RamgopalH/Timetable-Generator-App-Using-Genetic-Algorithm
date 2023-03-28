import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import TableView from './TableView';
import axios from 'axios';

import Form from './Form';
import { Button } from 'react-native-paper';
export default function App() {
  const [message,setMessage]=useState({});
  const [fetched,setFetched]=useState(false);
  const fetchData = async(subjects,faculty,time,credits) =>{
    axios.post("http://172.16.203.115:3000/",{
      subjects:subjects,
      faculty:faculty,
      time:time,
      credits:credits
    }).then((response)=> {
      console.log(response.data);
      setMessage(response.data);
      console.log(message);
      setFetched(true);
      return response.data;
    }).catch((err)=>{
      console.log(err);
      return err;
    })
  }


  return (
    <View style={styles.container}>
      
      {fetched?<View><TableView tt={message} /><Button title="Return" onPress={()=>{
        setFetched(false);
      }}>Return
      </Button></View>:  <View >
              <Form fetchFunc={fetchData}/>
              </View>}
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:'1',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing:'border-box',
    margin:'20%',
  },
});
