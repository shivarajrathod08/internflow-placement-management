package com.internflow.modules.document.storage;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.storage")
public class StorageProperties {

    /**
     * Storage type: "local" or "s3". Defaults to "local".
     */
    private String type = "local";

    /**
     * Configuration for local disk storage.
     */
    private LocalProperties local = new LocalProperties();

    /**
     * Configuration for Cloudflare R2 / AWS S3 compatible storage.
     */
    private S3Properties s3 = new S3Properties();

    @Getter
    @Setter
    public static class LocalProperties {
        private String dir = "./uploads";
    }

    @Getter
    @Setter
    public static class S3Properties {
        private String endpoint;
        private String region = "auto";
        private String bucket;
        private String accessKey;
        private String secretKey;
        private boolean pathStyleAccess = true;
    }
}
