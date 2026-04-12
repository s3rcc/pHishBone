import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export function SuspenseLoader() {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                gap: 2,
            }}
        >
            <CircularProgress color="primary" size={48} thickness={4} />
            <Typography variant="body2" color="text.secondary">
                Loading…
            </Typography>
        </Box>
    );
}

export default SuspenseLoader;
