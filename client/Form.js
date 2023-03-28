import React, {useEffect, useState} from 'react';
import {Text, StyleSheet, View, TextInput, Button} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import MultiSelect from 'react-native-multiple-select'  
import { RadioButton } from 'react-native-paper';
import axios from 'axios'

const Form = (props) => {
    const [selectedSubjects,setSelectedSubjects]=useState([]);
    const [facOptions, setFacOptions] = useState([]);
    const [faculty, setFaculty]=useState([]);
    const [items, setItems] = useState([]);
    const [time,setTime]= useState("");
    const [credits,setCredits]=useState("");

    const startFetch = async ()=> {
      axios.get("http://172.16.203.115:3000/start").then((response)=> {
        console.log(response.data);
        setItems(response.data);
      }).catch((err)=> {
        console.log(err);
      });
    }

    const fetchFac = async (codes)=> {
      console.log(codes);
      axios.post("http://172.16.203.115:3000/fac",  {
        codes: codes
      }).then((response)=> {
        console.log(response.data.faculty);
        var data = [];
        for(var fac of response.data.faculty) {
          data.push({id:fac.faculty, name:fac.faculty})
        }
        console.log(data);
        setFacOptions(data);
      }).catch((err)=>{
        console.log(err);
      });
    }

  useEffect(()=>{
    startFetch();
  }, [])
  
  return (
    <View style={styles.container} >
      <View>
        <MultiSelect items={items} uniqueKey="id" onSelectedItemsChange={(selectedItems)=>{
            setSelectedSubjects(selectedItems);
            fetchFac(selectedItems);
            console.log(facOptions);
        }} selectedItems={selectedSubjects} searchInputPlaceholderText="Search Codes..." onChangeInput={ (text)=> console.log(text)} selectedItemTextColor="#CCC"
        selectedItemIconColor="#CCC"/>
         <MultiSelect items={facOptions} uniqueKey="id" onSelectedItemsChange={(selectedItems)=>{
            setFaculty(selectedItems);
            console.log(selectedItems);
        }} selectedItems={faculty} searchInputPlaceholderText="Search Codes..." onChangeInput={ (text)=> console.log(text)} selectedItemTextColor="#CCC"
        selectedItemIconColor="#CCC"/>
       
       <RadioButton.Group onValueChange={(value)=>{
        setTime(value)
       }} value={time}>
        <View style={{display:"flex",flexDirection:"row", flexWrap:"wrap",justifyContent:"space-evenly"}}>
          <Text style={{padding:10}}>Morning</Text>
          <RadioButton.Android color='#000' value="Morning" status={time==='Morning'?'checked':'unchecked'} />
        
          <Text style={{padding:10}}>Afternoon</Text>
             
        <RadioButton.Android value="Afternoon"status={time==='Afternoon'?'checked':'unchecked'}/>
        </View>
      </RadioButton.Group>
       <TextInput placeholder='Credits' value={credits} onChangeText={(credits)=>{
        setCredits(credits) 
       }}/>
     
        <Button title='generate' onPress={()=>{
            props.fetchFunc(selectedSubjects,faculty,time,credits);
        }} />
      </View>
    </View>
  );
};

const styles =StyleSheet.create({
    container:{display:'flex',justifyContent:'center',alignItems:'center',margin:'auto'},
    input:{marginVertical:50}
})

export default Form;