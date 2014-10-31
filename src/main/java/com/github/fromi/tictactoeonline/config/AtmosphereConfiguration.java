package com.github.fromi.tictactoeonline.config;

import static org.atmosphere.annotation.AnnotationUtil.broadcaster;

import java.io.IOException;
import java.util.LinkedList;
import java.util.List;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRegistration;

import org.atmosphere.cache.UUIDBroadcasterCache;
import org.atmosphere.client.TrackMessageSizeInterceptor;
import org.atmosphere.config.managed.ManagedAtmosphereHandler;
import org.atmosphere.config.managed.ManagedServiceInterceptor;
import org.atmosphere.cpr.AtmosphereFramework;
import org.atmosphere.cpr.AtmosphereHandler;
import org.atmosphere.cpr.AtmosphereInterceptor;
import org.atmosphere.cpr.AtmosphereServlet;
import org.atmosphere.cpr.BroadcastFilter;
import org.atmosphere.cpr.BroadcasterConfig;
import org.atmosphere.cpr.DefaultBroadcaster;
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
            handle((Class) ActivityService.class, "/websocket/activity");
            handle((Class) TrackerService.class, "/websocket/tracker");
        }

        private void handle(Class annotatedClass, String path) {
            try {

                this.setBroadcasterCacheClassName(UUIDBroadcasterCache.class.getName());

                List<AtmosphereInterceptor> l = new LinkedList<>();

                Object c = this.newClassInstance(Object.class, annotatedClass);
                AtmosphereHandler handler = this.newClassInstance(null, ManagedAtmosphereHandler.class).configure(this.getAtmosphereConfig(), c);

                // MUST BE ADDED FIRST, ALWAYS!
                l.add(this.newClassInstance(null, ManagedServiceInterceptor.class));
                l.add(this.newClassInstance(null, AtmosphereResourceLifecycleInterceptor.class));
                l.add(this.newClassInstance(null, TrackMessageSizeInterceptor.class));
                l.add(this.newClassInstance(null, SuspendTrackerInterceptor.class));

                this.filterManipulator(new BroadcasterConfig.FilterManipulator() {
                    @Override
                    public Object unwrap(Object o) {
                        if (o != null && ManagedAtmosphereHandler.Managed.class.isAssignableFrom(o.getClass())) {
                            o = ManagedAtmosphereHandler.Managed.class.cast(o).object();
                        }
                        return o;
                    }

                    @Override
                    public BroadcastFilter.BroadcastAction wrap(BroadcastFilter.BroadcastAction a, boolean wasWrapped) {
                        if (wasWrapped) {
                            return new BroadcastFilter.BroadcastAction(a.action(), new ManagedAtmosphereHandler.Managed(a.message()));
                        } else {
                            return a;
                        }
                    }
                });

                this.addAtmosphereHandler(path, handler, broadcaster(this, DefaultBroadcaster.class, path), l);
            } catch (Exception e) {
                logger.warn("", e);
            }
        }

    }
}
