import axios from 'axios';
const API_URL = 'http://localhost:8000'

export const pred_planet = async(data) =>
{
    const response = await axios.post(`${API_BASE_URL}/predict`, {
        features: features.map(Number)  // ensure numbers
      });
      return response.data;
    };
