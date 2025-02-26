import * as React from "react";
import { StyleSheet } from "react-native";
import { Searchbar } from "react-native-paper";

const SearchBar = ({ onSearch, value = "" }) => {
  const [searchQuery, setSearchQuery] = React.useState(value);
  const searchTimeout = React.useRef(null);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      onSearch(query);
    }, 300);
  };

  React.useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  return (
    <Searchbar
      placeholder="搜索宠物"
      onChangeText={handleSearch}
      value={searchQuery}
      style={styles.searchBar}
      iconColor="#666"
      inputStyle={styles.input}
      elevation={1}
    />
  );
};

const styles = StyleSheet.create({
  searchBar: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  input: {
    fontSize: 16,
  },
});

export default React.memo(SearchBar);
