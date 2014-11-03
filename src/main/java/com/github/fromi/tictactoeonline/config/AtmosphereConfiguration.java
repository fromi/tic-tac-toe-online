package com.github.fromi.tictactoeonline.config;

import java.io.IOException;
import java.util.LinkedList;
import java.util.List;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRegistration;

import org.atmosphere.client.TrackMessageSizeInterceptor;
import org.atmosphere.config.managed.ManagedAtmosphereHandler;
import org.atmosphere.config.managed.ManagedServiceInterceptor;
import org.atmosphere.cpr.AtmosphereFramework;
import org.atmosphere.cpr.AtmosphereHandler;
import org.atmosphere.cpr.AtmosphereInterceptor;
import org.atmosphere.cpr.AtmosphereServlet;
import org.atmosphere.cpr.SessionSupport;
import org.atmosphere.interceptor.AtmosphereResourceLifecycleInterceptor;
import org.atmosphere.interceptor.SuspendTrackerInterceptor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.embedded.ServletContextInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.github.fromi.tictactoeonline.web.websocket.ActivityService;
import com.github.fromi.tictactoeonline.web.websocket.TrackerService;

@Configuration
public class AtmosphereConfiguration implements ServletContextInitializer {

    private final Logger log = LoggerFactory.getLogger(AtmosphereConfiguration.class);

    @Bean
    public ActivityService activityService() {
        return new ActivityService();
    }

    @Bean
    public TrackerService trackerService() {
        return new TrackerService();
    }

    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {
        log.debug("Registering Atmosphere Servlet");
        AtmosphereServlet servlet = new NoAnalyticsAtmosphereServlet();

        AtmosphereFramework framework = servlet.framework();
        servletContext.setAttribute("AtmosphereServlet", framework);
        servletContext.addListener(new SessionSupport());
        framework.allowAllClassesScan(false);

        registerServlet(servletContext, servlet);
    }

    private void registerServlet(ServletContext servletContext, AtmosphereServlet servlet) {
        ServletRegistration.Dynamic servletRegistration = servletContext.addServlet("atmosphereServlet", servlet);
        servletRegistration.addMapping("/websocket/*");
        servletRegistration.setLoadOnStartup(3);
        servletRegistration.setAsyncSupported(true);
    }

    private class NoAnalyticsAtmosphereServlet extends AtmosphereServlet {
        @Override
        protected AtmosphereFramework newAtmosphereFramework() {
            return new NoAnalyticsAtmosphereFramework();
        }
    }

    private class NoAnalyticsAtmosphereFramework extends AtmosphereFramework {
        @Override
        protected void analytics() {
        }

        @Override
        protected void autoConfigureService(ServletContext sc) throws IOException {
            handle(activityService(), "/websocket/activity");
            handle(trackerService(), "/websocket/tracker");
        }

        private void handle(Object managedService, String path) {
            List<AtmosphereInterceptor> interceptors = new LinkedList<>();
            // MUST BE ADDED FIRST, ALWAYS!
            interceptors.add(new ManagedServiceInterceptor());
            interceptors.add(new AtmosphereResourceLifecycleInterceptor());
            interceptors.add(new TrackMessageSizeInterceptor());
            interceptors.add(new SuspendTrackerInterceptor());

            AtmosphereHandler handler = new ManagedAtmosphereHandler().configure(this.getAtmosphereConfig(), managedService);
            this.addAtmosphereHandler(path, handler, interceptors);
        }

    }
}
