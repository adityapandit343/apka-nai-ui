import { useCallback, useState } from 'react';

const defaultOptions = {
  enableHighAccuracy: false,
  timeout: 10000,
  maximumAge: 60000,
};

export function useCustomerLocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requestLocation = useCallback((options = defaultOptions) => {
    if (!navigator.geolocation) {
      const message = 'Location is not supported in this browser.';
      setError(message);
      return Promise.reject(new Error(message));
    }

    setLoading(true);
    setError('');

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };

          setLocation(nextLocation);
          setLoading(false);
          resolve(nextLocation);
        },
        (geoError) => {
          const message =
            geoError.code === geoError.PERMISSION_DENIED
              ? 'Please allow location access to find nearby shops.'
              : 'Could not read your location. Try again.';

          setError(message);
          setLoading(false);
          reject(new Error(message));
        },
        options
      );
    });
  }, []);

  return {
    location,
    loading,
    error,
    requestLocation,
  };
}
