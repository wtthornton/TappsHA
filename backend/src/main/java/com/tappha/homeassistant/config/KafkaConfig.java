package com.tappha.homeassistant.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * Kafka configuration for event processing
 * Sets up producer and consumer configurations for high-throughput event streaming
 */
@Configuration
public class KafkaConfig {
    
    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;
    
    @Value("${spring.kafka.producer.acks:all}")
    private String acks;
    
    @Value("${spring.kafka.producer.retries:3}")
    private int retries;
    
    @Value("${spring.kafka.producer.batch-size:16384}")
    private int batchSize;
    
    @Value("${spring.kafka.producer.buffer-memory:33554432}")
    private int bufferMemory;
    
    @Value("${spring.kafka.producer.compression-type:snappy}")
    private String compressionType;
    
    /**
     * Configure Kafka producer factory
     */
    @Bean
    public ProducerFactory<String, String> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.ACKS_CONFIG, acks);
        configProps.put(ProducerConfig.RETRIES_CONFIG, retries);
        configProps.put(ProducerConfig.BATCH_SIZE_CONFIG, batchSize);
        configProps.put(ProducerConfig.BUFFER_MEMORY_CONFIG, bufferMemory);
        configProps.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, compressionType);
        configProps.put(ProducerConfig.LINGER_MS_CONFIG, 10); // 10ms linger for batching
        configProps.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 5);
        configProps.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        configProps.put(ProducerConfig.MAX_REQUEST_SIZE_CONFIG, 1048576); // 1MB max message size
        
        return new DefaultKafkaProducerFactory<>(configProps);
    }
    
    /**
     * Configure Kafka template for sending messages
     */
    @Bean
    public KafkaTemplate<String, String> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
    
    /**
     * Create Home Assistant events topic
     */
    @Bean
    public NewTopic homeAssistantEventsTopic() {
        return TopicBuilder.name("homeassistant-events")
                .partitions(6) // 6 partitions for high throughput
                .replicas(1)   // 1 replica for development
                .configs(Map.of(
                    "retention.ms", "604800000", // 7 days retention
                    "cleanup.policy", "delete",
                    "compression.type", "snappy",
                    "max.message.bytes", "1048576" // 1MB max message size
                ))
                .build();
    }
    
    /**
     * Create event processing metrics topic
     */
    @Bean
    public NewTopic eventProcessingMetricsTopic() {
        return TopicBuilder.name("event-processing-metrics")
                .partitions(3)
                .replicas(1)
                .configs(Map.of(
                    "retention.ms", "2592000000", // 30 days retention
                    "cleanup.policy", "delete",
                    "compression.type", "snappy"
                ))
                .build();
    }
    
    /**
     * Create event filtering rules topic
     */
    @Bean
    public NewTopic eventFilteringRulesTopic() {
        return TopicBuilder.name("event-filtering-rules")
                .partitions(1)
                .replicas(1)
                .configs(Map.of(
                    "retention.ms", "31536000000", // 1 year retention
                    "cleanup.policy", "compact",
                    "compression.type", "snappy"
                ))
                .build();
    }
} 