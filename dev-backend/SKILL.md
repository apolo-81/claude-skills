---
name: dev-backend
description: Backend architecture: microservices, CQRS, event sourcing, sagas, Temporal, REST/GraphQL APIs, Clean/Hexagonal/DDD patterns.
---

# dev-backend

Skill consolidada para arquitectura y desarrollo backend distribuido.

## Cuándo usar

- Diseñar microservices, service mesh, event-driven systems
- Implementar CQRS (Command Query Responsibility Segregation)
- Event sourcing, event stores, projections
- Saga patterns para transacciones distribuidas
- Workflows duraderos con Temporal (Python o TypeScript)
- Diseñar APIs REST o GraphQL
- Aplicar Clean Architecture, Hexagonal, DDD

## Sub-dominios cubiertos

### Microservices
- Definición de boundaries de servicio
- Comunicación event-driven (Kafka, RabbitMQ, NATS)
- Circuit breakers, retries, bulkheads (resilience4j, Polly)
- Service discovery, load balancing
- Strangler fig pattern para migración de monolitos

### CQRS + Event Sourcing
- Separación de command y query models
- Event store design (EventStoreDB, PostgreSQL, DynamoDB)
- Projections y materialized views
- Snapshots para performance
- Eventual consistency patterns

### Saga Orchestration
- Choreography vs Orchestration
- Compensating transactions
- Saga state machine design
- Outbox pattern para garantías de entrega

### Temporal Workflows
- Workflow vs Activity separation
- Determinism constraints
- Time-skipping en tests (pytest-temporal)
- Replay safety
- Long-running process patterns

### API Design
- REST: resource naming, HATEOAS, versioning, pagination
- GraphQL: schema design, resolvers, N+1, DataLoader
- gRPC: protobuf, streaming, interceptors
- OpenAPI 3.1 spec generation

### Arquitecturas limpias
- Clean Architecture (entities, use cases, adapters)
- Hexagonal Architecture (ports & adapters)
- DDD: aggregates, value objects, domain events, bounded contexts

## Guías rápidas

**Al diseñar un servicio nuevo:** Define el bounded context primero → identifica aggregates → diseña eventos de dominio → define APIs

**Al implementar CQRS:** Commands sincrónicos → Events asíncronos → Projections para reads → Read model separado de write model

**Al usar Temporal:** Workflows deben ser deterministas → toda I/O va en Activities → usa signals para comunicación externa
