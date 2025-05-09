import React from 'react';
import { mount } from 'enzyme';
import App from './App';
import { mockStations } from './test/mocks';

describe('EV Charging App', () => {
  // Test 1: Renders search bar and map
  it('shows search UI and map container', () => {
    const wrapper = mount(<App />);
    expect(wrapper.find('SearchBar').exists()).toBe(true);
    expect(wrapper.find('Map').exists()).toBe(true);
  });

  // Test 2: Displays stations after search
  it('renders stations after search', () => {
    const wrapper = mount(<App />);
    wrapper.find('SearchBar').prop('onSearch')(mockStations);
    expect(wrapper.find('StationCard').length).toBe(mockStations.length);
  });
});