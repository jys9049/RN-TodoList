import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "./colors/colors";

type TodoType = {
  [key: string]: {
    text: string;
    working: boolean;
    complete: boolean;
  };
};

const STORAGE_KEY = "@todos";
const MENU_KEY = "@menu";

export default function RootLayout() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [todos, setTodos] = useState<TodoType>({});
  const [loading, setLoading] = useState(true);
  const [editKey, setEditKey] = useState("");
  const [editText, setEditText] = useState("");

  const menuChange = async (type: boolean) => {
    try {
      setWorking(type);
      await AsyncStorage.setItem(MENU_KEY, JSON.stringify(type));
    } catch (e) {
      console.log(e);
    }
  };

  const onChangeText = (payload: string) => {
    setText(payload);
  };

  const onChangeEditText = (payload: string) => {
    setEditText(payload);
  };

  const saveTodos = async (toSave: TodoType) => {
    try {
      const jsonValue = JSON.stringify(toSave);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error(e);
    }
  };

  const loadData = async () => {
    try {
      const menuState = await AsyncStorage.getItem(MENU_KEY);
      const todoValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (!todoValue) return;
      setWorking(menuState === "true");
      setTodos(JSON.parse(todoValue));
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  };
  const addTodo = async () => {
    if (text === "") {
      return;
    }
    //  save to do
    const newTodos = {
      ...todos,
      [Date.now()]: { text, working: working, complete: false },
    };
    setText("");
    setTodos(newTodos);
    await saveTodos(newTodos);
  };

  const completeTodo = (key: string) => {
    const newTodos = { ...todos };
    newTodos[key].complete = !newTodos[key].complete;
    setTodos(newTodos);
    saveTodos(newTodos);
  };

  const editTodo = (key: string) => {
    if (editKey !== key) {
      setEditKey(key);
      setEditText(todos[key].text);
    } else {
      setEditKey("");
    }
  };

  const editComplete = async (key: string) => {
    if (editText === "") {
      setEditText("");
      return;
    }

    const newTodos = {
      ...todos,
    };
    newTodos[key].text = editText;
    setEditKey("");
    setEditText("");
    setTodos(newTodos);
    await saveTodos(newTodos);
  };

  const deleteTodo = (key: string) => {
    Alert.alert("Delete To Do?", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "i`m Sure",
        style: "destructive",
        onPress: () => {
          const newTodos = { ...todos };
          delete newTodos[key];
          setTodos(newTodos);
          saveTodos(newTodos);
        },
      },
    ]);
    return;
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <Pressable onPress={() => menuChange(true)}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.gray }}
          >
            Work
          </Text>
        </Pressable>
        <Pressable onPress={() => menuChange(false)}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.gray,
            }}
          >
            Travel
          </Text>
        </Pressable>
      </View>
      <View>
        <TextInput
          autoCorrect={false}
          onChangeText={onChangeText}
          returnKeyType="done"
          value={text}
          placeholder={working ? "Add a To Do" : "Where do you want to go?"}
          style={styles.input}
          onSubmitEditing={addTodo}
        />
      </View>

      <ScrollView>
        {loading ? (
          <ActivityIndicator size={"large"} />
        ) : (
          Object.keys(todos).map((key) =>
            todos[key].working === working ? (
              <View
                key={key}
                style={{
                  ...styles.todo,
                  backgroundColor: key === editKey ? "white" : theme.todoBg,
                }}
              >
                {key === editKey ? (
                  <TextInput
                    autoCorrect={false}
                    onSubmitEditing={() => editComplete(key)}
                    focusable={key === editKey}
                    style={styles.editInput}
                    placeholder={todos[key].text}
                    value={editText}
                    onChangeText={onChangeEditText}
                    autoFocus
                  />
                ) : (
                  <Text
                    style={{
                      ...styles.todoText,
                      textDecorationLine: todos[key].complete
                        ? "line-through"
                        : "none",
                    }}
                  >
                    {todos[key].text}
                  </Text>
                )}
                <View style={styles.todoBtnGroup}>
                  <TouchableOpacity onPress={() => completeTodo(key)}>
                    <FontAwesome
                      name="check-square-o"
                      size={18}
                      color={theme.gray}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => editTodo(key)}>
                    <Feather name="edit" size={18} color={theme.gray} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteTodo(key)}>
                    <Entypo name="trash" size={18} color={theme.gray} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 28,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginVertical: 20,
    fontSize: 18,
  },
  editInput: {
    flex: 1,
    backgroundColor: "white",
  },
  todo: {
    flex: 1,
    backgroundColor: theme.todoBg,
    marginBottom: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  todoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  todoBtnGroup: {
    flexDirection: "row",
    gap: 8,
  },
});
