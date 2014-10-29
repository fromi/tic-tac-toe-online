package com.github.fromi.tictactoeonline.config;

import java.io.IOException;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRegistration;

import org.atmosphere.annotation.ManagedServiceProcessor;
import org.atmosphere.cpr.AtmosphereFramework;
import org.atmosphere.cpr.AtmosphereServlet;
import org.atmosphere.cpr.SessionSupport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.embedded.ServletContextInitializer;
import org.springframework.context.annotation.Configuration;

import com.github.fromi.tictactoeonline.web.websocket.ActivityService;
import com.github.fromi.tictactoeonline.web.websocket.TrackerService;

@Configuration
public class AtmosphereConfiguration implements ServletContextInitializer {

    private final Logger log = LoggerFactory.getLogger(AtmosphereConfiguration.class);

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
            ManagedServiceProcessor managedServiceProcessor = new ManagedServiceProcessor();
            managedServiceProcessor.handle(this, (Class) ActivityService.class);
            managedServiceProcessor.handle(this, (Class) TrackerService.class);
        }
    }
}
