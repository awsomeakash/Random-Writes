import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {apiUrl} from './src/config';

const App = () => {
  const [quote, setQuote] = useState<{
    id: number;
    text: string;
    weightage: number;
    weightage_at: string | null;
  }>({id: 0, text: '', weightage: 0, weightage_at: null});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        'https://kkjwm3nu69.execute-api.us-east-1.amazonaws.com/dev/api/quotes?test=true',
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setQuote(data);
    } catch (err) {
      setError('Failed to fetch quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e1e2e" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Random Writes</Text>
      </View>

      <View style={styles.quoteContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#6c72cb" />
        ) : error ? (
          <View>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={fetchQuote}>
              <Text style={styles.refreshButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScrollView
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}>
              <Text style={styles.quoteText}>{quote.text}</Text>
            </ScrollView>
            <Text style={styles.quoteId}>Quote #{quote.id}</Text>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={fetchQuote}>
        <Text style={styles.refreshButtonText}>New Quote</Text>
      </TouchableOpacity>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e2e',
    padding: 16,
  },
  header: {
    marginTop: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  quoteContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#2d2d42',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  quoteText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#ffffff',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'serif',
    marginBottom: 12,
  },
  quoteId: {
    fontSize: 12,
    color: '#6c72cb',
    textAlign: 'right',
    alignSelf: 'stretch',
    marginTop: 8,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#6c72cb',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
