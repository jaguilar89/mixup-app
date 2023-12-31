import Grid from '@mui/material/Grid'
import EventCard from '../events/EventCard'
import Container from '@mui/material/Container';
import Box from '@mui/material/Box'
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home({ events, setEvents }) {
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchEvents() {
            try {
                const res = await fetch('/api/events')
                const eventsList = await res.json();
                setEvents(eventsList)
            } catch (error) {
                console.error(error)
            }
        }

        fetchEvents()
    }, []);

    const eventCards =
        events?.filter((event) => new Date() < new Date(event.event_end)) //filter out events that have already passed
               .map((event) => (
                    <Grid item
                        onClick={() => navigate(`/events/${event.id}`)}
                        key={event.id}
                    >
                        <EventCard
                            eventName={event?.event_name}
                            eventLocation={event?.place_name}
                            eventPic={event?.event_pic}
                            eventDate={event?.event_start}
                            attendances={event?.attendances.length}
                            availableSpots={event?.available_spots}
                            organizer={event.organizer?.full_name}
                        />
                    </Grid>
            ))
            
    return (
        <Container sx={{minHeight: '100vh'}}>
            <Box display='flex' justifyContent='center' marginTop='50px' >
            </Box>
            <Container sx={{paddingTop: '50px' }}>
                <br />
                <Grid container justifyContent='center' rowSpacing={5} columnSpacing={{ xs: 4, sm: 8, md: 10 }}>
                    {events && eventCards}
                </Grid>
            </Container>
        </Container>
    )
}

