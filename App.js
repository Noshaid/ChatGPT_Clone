import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Keyboard,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { GiftedChat } from "react-native-gifted-chat";
import * as Speech from "expo-speech";

const OPENAI_API_KEY = "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";

export default App = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [outputMessage, setOutputMessage] = useState(
    "Results to be shown here!"
  );
  const textInputRef = useRef(null);

  const handleSendButtonClick = () => {
    if (inputMessage !== "") {
      textInputRef.current.clear();
      Keyboard.dismiss();
      if (inputMessage.toLocaleLowerCase().startsWith("generate image")) {
        generateImage();
      } else {
        generateText();
      }
    }
  };

  const generateText = () => {
    console.log(inputMessage);
    const message = {
      _id: Math.random().toString(36).substring(7), //toString(36) => convert into base36 format
      text: inputMessage,
      createdAt: new Date(),
      sent: true,
      user: {
        _id: 1,
      },
    };
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, [message])
    );

    //************** Simple completion **************
    // fetch("https://api.openai.com/v1/completions", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${OPENAI_API_KEY}`,
    //   },
    //   body: JSON.stringify({
    //     "prompt": inputMessage,
    //     model: "text-davinci-003",
    //   }),
    // })
    //   .then((response) => response.json())
    //   .then((responseJSONData) => {
    //     console.log(responseJSONData?.choices[0]?.text);
    //     setOutputMessage(responseJSONData?.choices[0]?.text?.trim());
    //   });

    //************** Chat completion **************
    fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: inputMessage }],
        model: "gpt-4", //"gpt-3.5-turbo",
      }),
    })
      .then((response) => response.json())
      .then((responseJSONData) => {
        console.log(responseJSONData?.choices[0]?.message?.content);
        setInputMessage("");
        setOutputMessage(responseJSONData?.choices[0]?.message?.content.trim());
        const message = {
          _id: Math.random().toString(36).substring(7), //toString(36) => convert into base36 format
          text: responseJSONData?.choices[0]?.message?.content.trim(),
          createdAt: new Date(),
          received: true,
          user: {
            _id: 2,
            name: "Chat GPT",
          },
        };
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, [message])
        );
        setInputMessage("");
        options = {};
        Speech.speak(responseJSONData?.choices[0]?.message?.content, options);
      });
  };

  const generateImage = () => {
    console.log(inputMessage);
    const message = {
      _id: Math.random().toString(36).substring(7), //toString(36) => convert into base36 format
      text: inputMessage,
      createdAt: new Date(),
      sent: true,
      user: {
        _id: 1,
      },
    };
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, [message])
    );

    fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: inputMessage,
        n: 1, //number of images we want
        size: "1024x1024",
      }),
    })
      .then((response) => response.json())
      .then((responseJSONData) => {
        console.log(responseJSONData.data[0].url);
        setInputMessage("");
        setOutputMessage(responseJSONData.data[0].url);
        responseJSONData.data.forEach((item) => {
          const message = {
            _id: Math.random().toString(36).substring(7), //toString(36) => convert into base36 format
            text: "",
            createdAt: new Date(),
            received: true,
            user: {
              _id: 2,
              name: "Chat GPT",
            },
            image: item.url,
          };
          setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, [message])
          );
          setInputMessage("");
        });
      });
  };

  const handleTextInput = (text) => {
    setInputMessage(text);
  };

  return (
    // <ImageBackground
    //   source={require("./assets/bg.jpg")}
    //   resizeMode="cover"
    //   style={{ flex: 1, width: "100%", height: "100%" }}
    // >
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, justifyContent: "center" }}>
          <GiftedChat
            messages={messages}
            renderInputToolbar={() => {}}
            user={{ _id: 1 }}
            minInputToolbarHeight={0}
          />
        </View>
        <View style={{ flexDirection: "row", marginBottom: 20 }}>
          <View
            style={{
              flex: 1,
              marginHorizontal: 10,
              borderWidth: 1,
              borderColor: "#D3D3D3",
              justifyContent: "center",
              borderRadius: 10,
              paddingHorizontal: 5,
              backgroundColor: "white",
            }}
          >
            <TextInput
              placeholder="Enter your query"
              onChangeText={(updatedText) => handleTextInput(updatedText)}
              clearButtonMode="always"
              ref={textInputRef}
            />
          </View>
          <TouchableOpacity onPress={handleSendButtonClick}>
            <View
              style={{
                backgroundColor: "#55c2da",
                padding: 10,
                marginRight: 10,
                borderRadius: 50 / 2,
                height: 50,
                width: 50,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialIcons
                name="send"
                size={30}
                color="white"
                style={{ marginLeft: 2 }}
              />
            </View>
          </TouchableOpacity>
        </View>
        <StatusBar style="auto" />
      </KeyboardAvoidingView>
    </SafeAreaView>
    // </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
