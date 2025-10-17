import React from 'react';
import { SafeAreaView, ScrollView, View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
const Pill = ({label}:{label:string}) => (
  <View style={{paddingVertical:8,paddingHorizontal:14, borderRadius:999, backgroundColor:'rgba(255,255,255,0.08)', marginRight:8, marginTop:8}}>
    <Text style={{color:'#fff', fontWeight:'600'}}>{label}</Text>
  </View>
);
const Card = ({title}:{title:string}) => (
  <View style={{backgroundColor:'rgba(255,255,255,0.06)', borderRadius:18, padding:16, marginBottom:12, borderWidth:1, borderColor:'rgba(255,255,255,0.08)'}}>
    <Text style={{color:'#eaeaea', fontWeight:'700', marginBottom:6}}>{title}</Text>
    <Text style={{color:'#c8c8c8'}}>Kjem ittekvart…</Text>
  </View>
);
export default function App(){
  return (
    <SafeAreaView style={{flex:1, backgroundColor:'#0b0f1a'}}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{padding:16}}>
        <Text style={{color:'#eaeaea', fontSize:24, fontWeight:'800', marginBottom:12}}>Voss Taxi</Text>
        <View style={{flexDirection:'row', flexWrap:'wrap'}}>
          <Pill label="Forside" /><Pill label="Vakter" /><Pill label="Skuleruter i morgon" /><Pill label="Chat" /><Pill label="Logg" /><Pill label="Innstillingar" />
        </View>
        <View style={{height:12}} />
        <Card title="Forside" /><Card title="Vakter denne veka" /><Card title="Skuleruter i morgon" /><Card title="Chat" /><Card title="Logg" /><Card title="Innstillingar" />
      </ScrollView>
    </SafeAreaView>
  );
}
