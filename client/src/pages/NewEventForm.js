import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import { Alert } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NewEventForm({setEvents}) {
    const [eventName, setEventName] = useState('')
    const [eventLocation, setEventLocation] = useState('')
    const [maxAttendees, setMaxAttendees] = useState('')
    const [eventDescription, setEventDescription] = useState('')
    const [errors, setErrors] = useState([])
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        const res = await fetch('/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                event_name: eventName,
                event_location: eventLocation,
                available_spots: maxAttendees,
                event_description: eventDescription
            })
        });

        if (res.ok) {
            const event = await res.json()
            setEvents(event)
            navigate(`/events/${event.id}`)
        } else {
            const errorObj = await res.json();
            setErrors(errorObj.errors)
            console.log(errorObj)
        }
    }

    return (
        <Container maxWidth='md' sx={{ border: '1px solid black' }}>
            <Box component='form'
                onSubmit={handleSubmit}
                sx={{
                    border: '1px dotted black',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '50%',
                    m: 'auto'
                }
                }>
                <TextField
                    margin="normal"
                    required
                    id="event-name"
                    label='Event Name'
                    name="event_name"
                    onChange={(e) => setEventName(e.target.value)}
                />
                <FormControl required>
                    <InputLabel id='event-select-label'>City</InputLabel>
                    <Select
                        labelId="event-location-select-label"
                        id="event-location"
                        name='event_location'
                        label="Event Location"
                        onChange={(e) => setEventLocation(e.target.value)}
                        value={eventLocation}
                    >
                        <MenuItem value="nyc">New York City</MenuItem>
                        <MenuItem value="denver">Denver</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    margin="normal"
                    required
                    id="available-spots"
                    label='Max # of Attendees'
                    name="available_spots"
                    onChange={(e) => setMaxAttendees(e.target.value)}
                />
                <TextField
                    margin="normal"
                    required
                    multiline
                    id="event-description"
                    label='Event Description'
                    name="event_description"
                    onChange={(e) => setEventDescription(e.target.value)}
                />
                <Button variant="contained" type="submit">Submit</Button>
                {errors && errors.map((err) => <Alert key={err} severity="error">{err}</Alert>)}
            </Box>
        </Container>
    )
}