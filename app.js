// App.js
import React, { useState } from 'react';
import { StyleSheet, View, Text, Button, Picker, Platform, Alert } from 'react-native';
import DatePicker from 'react-native-date-picker';

const cities = {
  Elobour: {
    name: 'Al Obour',
    coords: { lat: 30.1933, lon: 31.4603 }
  },
  October: {
    name: 'Madīnat Sittah Uktūbar',
    coords: { lat: 29.9361, lon: 30.9269 }
  }
};

export default function App() {
  const [selectedCity, setSelectedCity] = useState('Elobour');
  const [date, setDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [temperatureData, setTemperatureData] = useState(null);
  const [error, setError] = useState(null);

  const getTemperature = async () => {
    try {
      const city = cities[selectedCity];
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let apiUrl, maxTemp, minTemp, dataSource;

      if (selectedDate < today) {
        // Historical Data
        apiUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${city.coords.lat}&longitude=${city.coords.lon}&start_date=${formatDate(selectedDate)}&end_date=${formatDate(selectedDate)}&hourly=temperature_2m&timeformat=unixtime`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.error) throw new Error(data.reason);
        if (!data.hourly.temperature_2m.length) throw new Error('No historical data available');
        
        const temps = data.hourly.temperature_2m;
        maxTemp = Math.max(...temps).toFixed(1);
        minTemp = Math.min(...temps).toFixed(1);
        dataSource = 'Historical Data';
      } else {
        // Forecast Data
        apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.coords.lat}&longitude=${city.coords.lon}&daily=temperature_2m_max,temperature_2m_min&start_date=${formatDate(selectedDate)}&end_date=${formatDate(selectedDate)}&timezone=auto`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.error) throw new Error(data.reason);
        maxTemp = data.daily.temperature_2m_max[0].toFixed(1);
        minTemp = data.daily.temperature_2m_min[0].toFixed(1);
        dataSource = selectedDate.getTime() === today.getTime() ? 'Current Day Data' : 'Forecast Data';
      }

      setTemperatureData({ maxTemp, minTemp, dataSource });
      setError(null);
    } catch (err) {
      setError(err.message);
      setTemperatureData(null);
    }
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>City Temperature Check</Text>
      
      <Picker
        selectedValue={selectedCity}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedCity(itemValue)}>
        <Picker.Item label="Al Obour" value="Elobour" />
        <Picker.Item label="Madīnat Sittah Uktūbar" value="October" />
      </Picker>

      <Button
        title={`Select Date: ${formatDate(date)}`}
        onPress={() => setOpenDatePicker(true)}
      />

      <DatePicker
        modal
        open={openDatePicker}
        date={date}
        mode="date"
        onConfirm={(selectedDate) => {
          setOpenDatePicker(false);
          setDate(selectedDate);
        }}
        onCancel={() => {
          setOpenDatePicker(false);
        }}
      />

      <Button
        title="Get Temperature"
        onPress={getTemperature}
        color="#4CAF50"
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}

      {temperatureData && (
        <View style={styles.resultContainer}>
          <Text style={styles.cityName}>{cities[selectedCity].name}</Text>
          <Text style={styles.dateText}>{formatDate(date)}</Text>
          
          <View style={styles.tempContainer}>
            <View style={styles.tempItem}>
              <Text style={styles.tempLabel}>Max</Text>
              <Text style={styles.tempValue}>{temperatureData.maxTemp}°C</Text>
            </View>
            
            <View style={styles.tempItem}>
              <Text style={styles.tempLabel}>Min</Text>
              <Text style={styles.tempValue}>{temperatureData.minTemp}°C</Text>
            </View>
          </View>
          
          <Text style={styles.dataSource}>{temperatureData.dataSource}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
  resultContainer: {
    marginTop: 30,
    backgroundColor: '#e8f5e9',
    padding: 20,
    borderRadius: 10,
  },
  cityName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  dateText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  tempContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  tempItem: {
    alignItems: 'center',
  },
  tempLabel: {
    fontSize: 16,
    color: '#666',
  },
  tempValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  dataSource: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorContainer: {
    marginTop: 20,
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 10,
  },
  errorText: {
    color: '#b71c1c',
    textAlign: 'center',
  },
});