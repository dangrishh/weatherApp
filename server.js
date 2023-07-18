import express from 'express';
import { SuperfaceClient, InputValidationError } from '@superfaceai/one-sdk';
const app = express();
app.set('trust proxy', true);

// You can manage tokens here: https://superface.ai/insights
const sdk = new SuperfaceClient({ sdkAuthToken: 'sfs_8e04a1ae791eebe6b66d33e1eb2bce26f67d868983e1b166fd9fbccb2909e2467fbefeba654930ebb6db1930c23fe241cd8bb2d41719b9cf19fcabdbf4aa8a1c_07bd8382' });

async function run() {
  // Load the profile
  const profile = await sdk.getProfile('address/ip-geolocation@1.0.1');

  // Use the profile
  const result = await profile
    .getUseCase('IpGeolocation')
    .perform({
      ipAddress: '8.8.8.8'
    }, {
      provider: 'ipdata',
      security: {
        apikey: {
          apikey: 'fceb312326dd17801462d925ba4d9f27109c3adb7e718fe279a73758'
        }
      }
    });

  // Handle the result
  try {
    const data = result.unwrap();
    return data;
  } catch (error) {
    console.error(error);
  }
}

run();

async function weather(city) {
  // Load the profile
  const profile = await sdk.getProfile('weather/current-city@1.0.3');

  // Use the profile
  const result = await profile.getUseCase('GetCurrentWeatherInCity').perform(
    {
      city: city,
      units: 'C',
    },
    {
      provider: 'openweathermap',
      security: {
        apikey: {
          apikey: '2ee625e4f25a098bf6124c0ab7a90b7c',
        },
      },
    }
  );

  // Handle the result
  try {
    const data = result.unwrap();
    return data;
  } catch (error) {
    console.error(error);
  }
}

// ... (your previous code)

app.get('/', async (req, res) => {
  try {
    const result = await run(); // Call the `run` function directly

    if (!result || !result.addressLocality) {
      throw new Error('Invalid geolocation data');
    }

    const city = result.addressLocality;
    if (!city) {
      throw new Error('City data is null or empty');
    }

    res.send(await weather(city)); // Use `city` as the parameter for the `weather` function
  } catch (error) {
    if (error instanceof InputValidationError) {
      // Handle input validation errors
      res.status(400).send({ error: 'Invalid input data' });
    } else {
      // Handle other errors
      console.log('Error:', error.message);
      res.status(500).send({ error: 'Internal server error' });
    }
  }
});

// ... (your previous code)


app.listen(3004, () => {
  console.log(`Server Listening on http://localhost:${3004}`);
});
