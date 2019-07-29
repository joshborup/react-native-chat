import React, { useState, useRef, useEffect } from "react";
import { ScrollIntoView, wrapScrollView } from "react-native-scroll-into-view";
import {
  StyleSheet,
  Text,
  ScrollView,
  View,
  TextInput,
  YellowBox,
  TouchableOpacity,
  KeyboardAvoidingView
} from "react-native";
import socketHook from "./hooks/socketHook";
import io from "socket.io-client";
const CustomScrollView = wrapScrollView(ScrollView);

const socket = io("http://192.168.0.37:4000");
YellowBox.ignoreWarnings([
  "Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?"
]);
export default function App() {
  const {
    sendMessage,
    message,
    joinRoom,
    roomName,
    setMessage,
    exitRoom
  } = socketHook(socket);
  const [userMessage, setUserMessage] = useState("");
  let latest = useRef();
  console.log(latest.current);
  function scroller() {
    if (latest && !latest.hasOwnProperty("current")) {
      console.log(latest.current);
    }
  }
  useEffect(() => {
    scroller();
  }, [message]);
  const showMessages = message.map((mes, index) => {
    return (
      <View
        key={mes.id}
        style={{
          padding: 10,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4
          },
          shadowOpacity: 0.32,
          shadowRadius: 5.46,
          elevation: 9,
          flex: 1
        }}
        ref={lastMes => {
          if (message.length - 1 === index) {
            latest = lastMes;
          }
        }}
      >
        <ScrollIntoView
          scrollIntoViewOptions={{
            insets: {
              top: 0,
              bottom: 80
            }
          }}
          style={{ flex: 1, flexDirection: "row" }}
        >
          <Text
            style={{
              color: "black",
              backgroundColor: "rgb(240,240,240)",
              flex: 1,
              padding: 10,
              borderRadius: 6,
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap"
            }}
          >
            {mes.mes}
          </Text>
        </ScrollIntoView>
      </View>
    );
  });
  return (
    <ScrollView
      contentContainerStyle={{
        display: "flex",
        justifyContent: "center",
        flex: 1,
        overflow: "scroll"
      }}
    >
      <ScrollView contentContainerStyle={viewStyles.container}>
        <ScrollView
          contentContainerStyle={{
            overflow: "scroll",
            display: "flex",
            flex: 1,
            alignSelf: "stretch",
            justifyContent: "flex-start",
            flexDirection: "column"
          }}
        >
          <CustomScrollView
            style={{
              overflow: "scroll"
            }}
          >
            {showMessages}
          </CustomScrollView>
        </ScrollView>

        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <KeyboardAvoidingView
            style={{
              height: 50,
              backgroundColor: "lightgrey",
              color: "black",
              flex: 1,
              paddingLeft: 10
            }}
            behavior="height"
            enabled={false}
          >
            <TextInput
              style={{
                height: 50,
                backgroundColor: "lightgrey",
                color: "black",
                flex: 1,
                paddingLeft: 10
              }}
              onChangeText={text => setUserMessage(text)}
              value={userMessage}
            />
          </KeyboardAvoidingView>
          <TouchableOpacity
            title="click"
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "lightblue",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.8,
              shadowRadius: 2,
              elevation: 1,
              height: 50,
              width: 100
            }}
            onPress={() => {
              if (userMessage.length) {
                sendMessage(userMessage);
                setUserMessage("");
              }
            }}
          >
            <Text style={{ fontSize: 22, fontWeight: "700" }}>Send</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScrollView>
  );
}

const viewStyles = StyleSheet.create({
  container: {
    color: "white",
    backgroundColor: "#fff",
    flex: 1,
    overflow: "scroll",
    paddingTop: 50
  }
});
