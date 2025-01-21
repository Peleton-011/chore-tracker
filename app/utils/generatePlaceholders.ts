export default function generatePlaceholders(_id: string) {
    // Call /api/tasks/generatePlaceholders
    try {
        fetch('/api/tasks/generatePlaceholders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ _id })
        });
    } catch (err) {
        console.error('Failed to generate placeholders:', err);
    }
}