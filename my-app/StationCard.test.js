import React from 'react';
import { shallow } from 'enzyme';
import StationCard from './StationCard';

describe('StationCard Component', () => {
  const mockStation = {
    id: '1',
    name: 'Fast Charger',
    address: '123 EV Road',
    connectors: ['CCS', 'Type 2'],
    available: true,
  };

  // Test 1: Renders station details correctly
  it('displays station name and address', () => {
    const wrapper = shallow(<StationCard station={mockStation} />);
    expect(wrapper.find('h3').text()).toBe('Fast Charger');
    expect(wrapper.find('p').at(0).text()).toContain('123 EV Road');
  });

  // Test 2: Shows "Available" badge
  it('shows availability status', () => {
    const wrapper = shallow(<StationCard station={mockStation} />);
    expect(wrapper.find('.badge').text()).toBe('Available');
  });
});