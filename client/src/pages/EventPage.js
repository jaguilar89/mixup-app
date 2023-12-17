import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import Button from "@mui/material/Button"
import Box from "@mui/material/Box";
import LoadingScreen from "../components/LoadingScreen";
import Container from "@mui/material/Container";
import EventEditForm from "../components/EventEditForm";
import EventCancelDialog from "../components/EventCancelDialog";
import Alert from "@mui/material/Alert";
import GoogleMaps from "../components/GoogleMaps";
import { Accordion, Grid, AccordionSummary, AvatarGroup, Typography, Link, Avatar } from "@mui/material";
import cardImage from '../images/cardimage.jpeg'
import * as dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import parse from 'html-react-parser'

export default function EventPage({ user }) {
    const [isLoading, setIsLoading] = useState(true)
    const [eventInfo, setEventInfo] = useState([])
    const [organizer, setOrganizer] = useState([])
    const [userAttendanceInfo, setUserAttendanceInfo] = useState([])
    const [attendees, setAttendees] = useState([])
    const [isAttending, setIsAttending] = useState(false)
    const [expanded, setExpanded] = useState(false) //Expand RSVP list
    const { eventId } = useParams(); //EVENT_ID
    const userId = user?.id
    const organizerName = organizer?.full_name
    const eventDetails = eventInfo?.event_description
    const parsedEventDetails = eventDetails && eventDetails.toString() && parse(eventDetails)  //parse the event details in HTML format in order to render correctly

    dayjs.extend(LocalizedFormat)
    const currentDate = new Date()
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const timeZoneoptions = { timeZone: userTimezone, timeZoneName: 'short', hour: '2-digit', minute: '2-digit' }
    const eventStart = eventInfo?.event_start
    const eventEnd = eventInfo?.event_end
    const formattedTimeZone = (event) => new Date(event).toLocaleTimeString('en-US', timeZoneoptions)
    const formattedEventDateTime = (event) => {
        return dayjs(event).format('LL') + ' ' + formattedTimeZone(event)
    }

    const eventHasPassed = currentDate > new Date(eventEnd)

    useEffect(() => {
        (async () => {
            const res = await fetch(`/api/events/${eventId}`)

            if (res.ok) {
                const event = await res.json();
                setEventInfo(event)
                setOrganizer(event.organizer)
                setIsAttending(event.is_attending)
                setIsLoading(false)
            } else {
                const error = await res.json()
                console.log(error)
            }
        })()
    }, [eventId])

    useEffect(() => {
        (async () => {
            const res = await fetch(`/api/events/${eventId}/attendances`)

            if (res.ok) {
                const attendanceRecords = await res.json()
                setAttendees(attendanceRecords)
                const userRecord = attendanceRecords.filter((rec) => rec.user_id === userId)
                if (userRecord.length !== 0) setUserAttendanceInfo(userRecord)
            } else {
                const error = await res.json()
                console.log(error)
            }
        })()
    }, [eventId, isAttending]);

    async function handleSubmitRsvp(e) {
        e.preventDefault();
        const res = await fetch(`/api/events/${eventId}/attendances`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: userId,
                event_id: eventId
            })
        })
        if (res.ok) {
            const attendance = await res.json()
            if (attendance) setIsAttending((isAttending) => !isAttending)
        } else {
            const error = await res.json()
            console.log(error)
        }
    }

    async function handleRemoveRsvp(e) {
        e.preventDefault()
        if (userAttendanceInfo.length !== 0) {
            const attendanceId = userAttendanceInfo[0].id
            const res = await fetch(`/api/events/${eventId}/attendances/${attendanceId}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                const msg = await res.json()
                console.log(msg)
                setUserAttendanceInfo(null)
                setIsAttending((isAttending) => !isAttending)
            } else {
                const error = await res.json()
                console.log(error)
            }
        } else {
            console.log('userAttendanceInfo is empty')
        }
    }

    async function handleCancelEvent(e) {
        e.preventDefault();
        const res = await fetch(`/api/events/${eventId}`, {
            method: 'DELETE'
        })
        if (res.ok) {
            window.location.href = '/home'
        } else {
            const error = await res.json()
            console.log(error)
        }
    }

    function renderEventOptions() {
        if (eventHasPassed) return;

        if (organizer.id === userId) {
            return (
                <Box component='div' display='flex' justifyContent='flex-start' alignItems='flex-start'>
                    <EventEditForm eventId={eventId} setEventInfo={setEventInfo} />
                    <br />
                    <EventCancelDialog onCancelEvent={handleCancelEvent} />
                </Box>
            )
        } else if (isAttending && organizer.id !== userId) {
            return (
                <div>
                    <Box component='form' onSubmit={handleRemoveRsvp}>
                        <Button variant="contained" type="submit">Cancel RSVP</Button>
                    </Box>
                </div>
            )
        } else if (!isAttending) {
            return (
                <div>
                    <Box component='form' onSubmit={handleSubmitRsvp}>
                        <Button variant="contained" type="submit">RSVP</Button>
                    </Box>
                </div>
            )
        }
    }

    function handleToggleExpand() {
        setExpanded(!expanded)
    }

    function displayAlert() {
        if (eventHasPassed) {
            return (
                <Alert severity="error" sx={{ "&.MuiAlert-root": { justifyContent: 'center' } }}>
                    This event has already ended.
                </Alert>
            )
        } else if (isAttending && !eventHasPassed) {
            return (
                <Alert severity="success" sx={{ "&.MuiAlert-root": { justifyContent: 'center' } }}>
                    You are attending this event!
                </Alert>
            )
        } else if (eventInfo?.organizer?.id === userId && !eventHasPassed) {
            return (
                <Alert severity="info" sx={{ "&.MuiAlert-root": { justifyContent: 'center' } }}>
                    You are organizing this event.
                </Alert>
            )
        }
    }

    return (
        <>
            {isLoading && <LoadingScreen />}
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                <Container sx={{ mb: '20px', width: '70%', textAlign: 'center' }}>
                    {displayAlert()}

                    <Box component='div' sx={{ pb: '20px', marginTop: '10px' }}>
                        <Typography variant="h3">{eventInfo.event_name}</Typography>
                        <Link href={`/profiles/${organizer?.id}`}>
                        <Typography variant="h6" sx={{ display: 'inline-flex', gap: '10px', pt: '10px' }}>
                            <Avatar alt={organizerName} src={eventInfo.organizer_avatar}/>
                            Hosted by {organizerName}
                        </Typography>
                        </Link>
                    </Box>
                        <Box 
                        component='img'
                        sx={{
                            height: 400,
                            width: 700
                        }}
                        alt="event picture"
                        src={eventInfo.event_pic || cardImage}
                        />
                    <Box component='div'>
                        <Typography variant="h4">Details</Typography>
                        {parsedEventDetails}
                    </Box>
                </Container>

                <Container sx={{ mb: '20px', mt: '15px', width: '35%' }}>
                    {renderEventOptions()}
                    <Box component='div' sx={{ p: '10px' }}>
                        <Typography variant="h6">Starts at: {formattedEventDateTime(eventStart)} </Typography>
                        <Typography variant="h6">Ends at: {formattedEventDateTime(eventEnd)} </Typography>
                        <Typography variant="h6">Spots available: {eventInfo.available_spots} spots(s) left</Typography>

                        <br />

                        {eventInfo?.place_identifier && <GoogleMaps eventInfo={eventInfo} />}
                    </Box>
                </Container>
            </Box>

            {/*----------------------------------------RSVPs------------------------------------------------------ */}

            <Typography variant="h3" sx={{ textAlign: 'center', pb: 2 }}> RSVPs</Typography>

            <Accordion expanded={expanded} onChange={handleToggleExpand}>
                <AccordionSummary>
                    <Box component='div' display='flex' alignItems='center' justifyContent='center' m='auto'>
                        {attendees && (
                            <AvatarGroup total={attendees.length}>
                                {attendees && attendees.slice(0, 4).map((obj) => (
                                    <Avatar 
                                        key={obj}
                                        alt={obj.full_name}
                                        src={obj.avatar}
                                    />
                                ))}
                            </AvatarGroup>
                        )}
                        {attendees.length === 0 && (
                            <Typography variant="h5">There are no RSVPs for this event so far</Typography>
                        )}
                    </Box>
                </AccordionSummary>
                <Box display='flex' justifyContent='center' alignItems='center'>
                    <Grid container rowSpacing={1} columnSpacing={10} sx={{ justifyContent: 'center' }}>
                        {attendees && attendees.map((el) => (
                            <Grid item key={el.user} xs={6} sm={6} md={6} sx={{ display: 'flex', flexDirection: 'row', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
                                <Box
                                    display='flex'
                                    flexDirection='column'
                                    alignItems='center'
                                    sx={{ width: '80%', maxWidth: '300px'}} // Adjust the width as per requirement
                                >
                                        <Avatar 
                                            alt={el.user.full_name}
                                            src={el.avatar}
                                        />
                                    <Link 
                                        href={`/profiles/${el.user.id}`} 
                                        sx={{"&.MuiLink-root": {textDecoration: 'none'}}}
                                    >
                                        <Typography variant="h6">{el.user.full_name}</Typography>
                                    </Link>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Accordion>
            <br />
        </>
    );

};
