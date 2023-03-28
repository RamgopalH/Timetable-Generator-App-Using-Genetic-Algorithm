
import { StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { DataTable } from 'react-native-paper';
import { ScrollView } from 'react-native';


const TableView = (props) =>{

    console.log(props.tt.Subjects);

    return (
        <ScrollView>
        <ScrollView  horizontal vertical>
          <DataTable style={styles.container}>
            <DataTable.Header>
              <DataTable.Title style={styles.cell}>Course</DataTable.Title>
              <DataTable.Title style={styles.cellbig}>Faculty</DataTable.Title>
              <DataTable.Title numeric style={styles.cell}>Credits</DataTable.Title>
              <DataTable.Title numeric style={styles.cell}>Slots</DataTable.Title>
            </DataTable.Header>
            {props.tt.Subjects.map((subject)=>{
                console.log(subject.Code);
                return (<DataTable.Row>
                   <DataTable.Cell style={styles.cell}>{subject.Code}</DataTable.Cell>
                   <DataTable.Cell  style={styles.cellbig}>{subject.Faculty}</DataTable.Cell>
                   <DataTable.Cell style={styles.cell}>{subject.Credits}</DataTable.Cell>
                   <DataTable.Cell style={styles.cell}>{subject.Slots.map((slot)=>{
                    return slot+","
                   })}</DataTable.Cell>
                </DataTable.Row>)
            })}
             
    
          </DataTable>
        </ScrollView>
        </ScrollView>
    )
}
const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff',display:'flex', justifyContent:'center' },
    head: {  backgroundColor: '#f1f8ff' ,display:'flex', justifyContent:'center' },
    text: { margin: 6 },
    cell:{textAlign:'center', display:'flex', justifyContent:'center',padding:16,marginHorizontal:16,width:200},
    cellbig:{textAlign:'center', display:'flex', justifyContent:'center',flex:5,width:300}
  });
export default TableView;