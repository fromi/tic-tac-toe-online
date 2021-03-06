package com.github.fromi.tictactoeonline.web.websocket;

import java.io.IOException;
import java.util.Calendar;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import javax.servlet.ServletContext;

import org.atmosphere.config.service.Disconnect;
import org.atmosphere.config.service.ManagedService;
import org.atmosphere.config.service.Message;
import org.atmosphere.cpr.AtmosphereFramework;
import org.atmosphere.cpr.AtmosphereRequest;
import org.atmosphere.cpr.AtmosphereResource;
import org.atmosphere.cpr.AtmosphereResourceEvent;
import org.atmosphere.cpr.Broadcaster;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.fromi.tictactoeonline.web.websocket.dto.ActivityDTO;
import com.github.fromi.tictactoeonline.web.websocket.dto.ActivityDTOJacksonDecoder;

@ManagedService(
        path = "/websocket/activity")
public class ActivityService {

    private static final Logger log = LoggerFactory.getLogger(ActivityService.class);

    private Broadcaster b;

    private final DateTimeFormatter dateTimeFormatter = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss");

    private final ObjectMapper jsonMapper = new ObjectMapper();

    @Inject
    private ServletContext servletContext;

    @PostConstruct
    public void init() {
        AtmosphereFramework atmosphereFramework = (AtmosphereFramework) servletContext.getAttribute("AtmosphereServlet");
        this.b = atmosphereFramework.getBroadcasterFactory().lookup("/websocket/tracker", true);
    }

    @Disconnect
    public void onDisconnect(AtmosphereResourceEvent event) throws IOException {
        log.debug("Browser {} disconnected", event.getResource().uuid());
        AtmosphereRequest request = event.getResource().getRequest();
        ActivityDTO activityDTO = new ActivityDTO();
        activityDTO.setUuid(event.getResource().uuid());
        activityDTO.setPage("logout");
        String json = jsonMapper.writeValueAsString(activityDTO);
        b.broadcast(json);
    }

    @Message(decoders = {ActivityDTOJacksonDecoder.class})
    public void onMessage(AtmosphereResource atmosphereResource, ActivityDTO activityDTO) throws IOException {
        if (activityDTO.getUserLogin() != null) {
            AtmosphereRequest request = atmosphereResource.getRequest();
            activityDTO.setUuid(atmosphereResource.uuid());
            activityDTO.setIpAddress(request.getRemoteAddr());
            activityDTO.setTime(dateTimeFormatter.print(Calendar.getInstance().getTimeInMillis()));
            String json = jsonMapper.writeValueAsString(activityDTO);
            log.debug("Sending user tracking data {}", json);
            b.broadcast(json);
        }
    }
}
