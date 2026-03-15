import React from 'react';
import { 
    Box, 
    List, 
    ListItem, 
    ListItemText, 
    ListItemAvatar, 
    Avatar, 
    IconButton, 
    Typography, 
    Button
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useTankStore } from '../../store/useTankStore';

interface TankItemListProps {
    onOpenSearch: () => void;
}

export const TankItemList: React.FC<TankItemListProps> = ({ onOpenSearch }) => {
    const { t } = useTranslation('TankBuilder');
    const items = useTankStore((state) => state.items);
    const updateQuantity = useTankStore((state) => state.updateQuantity);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    {items.length === 0 
                        ? t('emptyTank', 'Your tank is empty. Add some species!') 
                        : t('speciesCount', { count: items.length, defaultValue: '{{count}} species in tank' })}
                </Typography>
                <Button 
                    variant="contained" 
                    startIcon={<SearchIcon />} 
                    onClick={onOpenSearch}
                >
                    {t('addSpecies', 'Add Species')}
                </Button>
            </Box>

            <List disablePadding>
                {items.map((item) => (
                    <ListItem 
                        key={item.speciesId}
                        sx={{ 
                            bgcolor: 'background.default', 
                            mb: 1, 
                            borderRadius: 1,
                            border: 1,
                            borderColor: 'divider'
                        }}
                    >
                        <ListItemAvatar>
                            <Avatar src={item.species.thumbnailUrl} alt={item.species.commonName}>
                                {item.species.commonName.charAt(0)}
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                            primary={item.species.commonName}
                            secondary={item.species.scientificName}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => updateQuantity(item.speciesId, item.quantity - 1)}
                            >
                                {item.quantity <= 1 ? <DeleteIcon fontSize="small" /> : <RemoveIcon fontSize="small" />}
                            </IconButton>
                            
                            <Typography sx={{ minWidth: '30px', textAlign: 'center' }}>
                                {item.quantity}
                            </Typography>
                            
                            <IconButton 
                                size="small" 
                                color="primary" 
                                onClick={() => updateQuantity(item.speciesId, item.quantity + 1)}
                            >
                                <AddIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};
