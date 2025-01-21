import cron from 'node-cron';
import RecurringTaskDefinition from '@/models/RecurringTaskDefinition';
import generatePlaceholders from '../utils/generatePlaceholders';

cron.schedule('0 0 * * *', async () => { // Runs daily at midnight
  console.log('Running placeholder task generation...');
  const definitions = await RecurringTaskDefinition.find();

  for (const definition of definitions) {
    try {
      await generatePlaceholders(definition._id);
      console.log(`Updated placeholders for definition ${definition._id}`);
    } catch (err) {
      console.error(`Failed to update placeholders for definition ${definition._id}:`, err);
    }
  }
});


