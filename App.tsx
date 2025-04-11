import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
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
            <Text style={styles.quoteText}>{quote.text}</Text>
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
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  quoteContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2d2d42',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  quoteText: {
    fontSize: 20,
    lineHeight: 30,
    color: '#ffffff',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'serif',
    marginBottom: 20,
  },
  quoteId: {
    fontSize: 14,
    color: '#6c72cb',
    textAlign: 'right',
    alignSelf: 'stretch',
    marginTop: 10,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#6c72cb',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
