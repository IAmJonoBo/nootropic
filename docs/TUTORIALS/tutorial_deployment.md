# Tutorial: Deployment and Scaling

## Overview

This tutorial covers deployment and scaling strategies for nootropic, including containerization, orchestration, and infrastructure management.

## Containerization

### 1. Docker Configuration

1. **Base Image**
   ```dockerfile
   # Dockerfile
   FROM node:18-alpine

   # Install system dependencies
   RUN apk add --no-cache \
       python3 \
       py3-pip \
       build-base \
       git

   # Set working directory
   WORKDIR /app

   # Copy package files
   COPY package*.json ./
   COPY nx.json ./
   COPY tsconfig*.json ./

   # Install dependencies
   RUN npm install

   # Copy source code
   COPY . .

   # Build application
   RUN npm run build

   # Expose ports
   EXPOSE 3000

   # Start application
   CMD ["npm", "start"]
   ```

2. **Multi-stage Build**
   ```dockerfile
   # Dockerfile.multi
   # Build stage
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY . .
   RUN npm install
   RUN npm run build

   # Production stage
   FROM node:18-alpine
   WORKDIR /app
   COPY --from=builder /app/dist ./dist
   COPY --from=builder /app/node_modules ./node_modules
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

### 2. Docker Compose

1. **Development Environment**
   ```yaml
   # docker-compose.dev.yml
   version: '3.8'
   services:
     app:
       build:
         context: .
         dockerfile: Dockerfile
       ports:
         - "3000:3000"
       volumes:
         - .:/app
         - /app/node_modules
       environment:
         - NODE_ENV=development
         - DEBUG=true

     db:
       image: postgres:14
       ports:
         - "5432:5432"
       environment:
         - POSTGRES_USER=dev
         - POSTGRES_PASSWORD=dev
         - POSTGRES_DB=nootropic

     redis:
       image: redis:6
       ports:
         - "6379:6379"
   ```

2. **Production Environment**
   ```yaml
   # docker-compose.prod.yml
   version: '3.8'
   services:
     app:
       build:
         context: .
         dockerfile: Dockerfile.multi
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
       deploy:
         replicas: 3
         resources:
           limits:
             cpus: '1'
             memory: 1G
         restart_policy:
           condition: on-failure

     db:
       image: postgres:14
       volumes:
         - postgres_data:/var/lib/postgresql/data
       environment:
         - POSTGRES_USER=${DB_USER}
         - POSTGRES_PASSWORD=${DB_PASSWORD}
         - POSTGRES_DB=${DB_NAME}
       deploy:
         resources:
           limits:
             cpus: '2'
             memory: 2G

     redis:
       image: redis:6
       volumes:
         - redis_data:/data
       deploy:
         resources:
           limits:
             cpus: '0.5'
             memory: 512M

   volumes:
     postgres_data:
     redis_data:
   ```

## Orchestration

### 1. Kubernetes Configuration

1. **Deployment**
   ```yaml
   # k8s/deployment.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: nootropic
     labels:
       app: nootropic
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: nootropic
     template:
       metadata:
         labels:
           app: nootropic
       spec:
         containers:
         - name: nootropic
           image: nootropic:latest
           ports:
           - containerPort: 3000
           resources:
             limits:
               cpu: "1"
               memory: "1Gi"
             requests:
               cpu: "500m"
               memory: "512Mi"
           env:
           - name: NODE_ENV
             value: "production"
           - name: DB_HOST
             valueFrom:
               configMapKeyRef:
                 name: nootropic-config
                 key: db_host
           livenessProbe:
             httpGet:
               path: /health
               port: 3000
             initialDelaySeconds: 30
             periodSeconds: 10
           readinessProbe:
             httpGet:
               path: /ready
               port: 3000
             initialDelaySeconds: 5
             periodSeconds: 5
   ```

2. **Service**
   ```yaml
   # k8s/service.yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: nootropic
   spec:
     selector:
       app: nootropic
     ports:
     - port: 80
       targetPort: 3000
     type: LoadBalancer
   ```

### 2. Scaling Configuration

1. **Horizontal Pod Autoscaling**
   ```yaml
   # k8s/hpa.yaml
   apiVersion: autoscaling/v2
   kind: HorizontalPodAutoscaler
   metadata:
     name: nootropic
   spec:
     scaleTargetRef:
       apiVersion: apps/v1
       kind: Deployment
       name: nootropic
     minReplicas: 3
     maxReplicas: 10
     metrics:
     - type: Resource
       resource:
         name: cpu
         target:
           type: Utilization
           averageUtilization: 70
     - type: Resource
       resource:
         name: memory
         target:
           type: Utilization
           averageUtilization: 80
   ```

2. **Vertical Pod Autoscaling**
   ```yaml
   # k8s/vpa.yaml
   apiVersion: autoscaling.k8s.io/v1
   kind: VerticalPodAutoscaler
   metadata:
     name: nootropic
   spec:
     targetRef:
       apiVersion: "apps/v1"
       kind: Deployment
       name: nootropic
     updatePolicy:
       updateMode: "Auto"
     resourcePolicy:
       containerPolicies:
       - containerName: '*'
         minAllowed:
           cpu: 100m
           memory: 256Mi
         maxAllowed:
           cpu: 2
           memory: 2Gi
   ```

## Infrastructure Management

### 1. Infrastructure as Code

1. **Terraform Configuration**
   ```hcl
   # terraform/main.tf
   provider "aws" {
     region = var.aws_region
   }

   module "eks" {
     source = "terraform-aws-modules/eks/aws"
     version = "~> 18.0"

     cluster_name = "nootropic"
     cluster_version = "1.24"

     vpc_id = module.vpc.vpc_id
     subnet_ids = module.vpc.private_subnets

     eks_managed_node_groups = {
       general = {
         desired_size = 3
         min_size = 1
         max_size = 5

         instance_types = ["t3.medium"]
         capacity_type = "ON_DEMAND"
       }
     }
   }

   module "vpc" {
     source = "terraform-aws-modules/vpc/aws"
     version = "~> 3.0"

     name = "nootropic-vpc"
     cidr = "10.0.0.0/16"

     azs = ["us-west-2a", "us-west-2b", "us-west-2c"]
     private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
     public_subnets = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

     enable_nat_gateway = true
     single_nat_gateway = true
   }
   ```

2. **Helm Chart**
   ```yaml
   # helm/nootropic/values.yaml
   replicaCount: 3

   image:
     repository: nootropic
     tag: latest
     pullPolicy: IfNotPresent

   service:
     type: LoadBalancer
     port: 80

   resources:
     limits:
       cpu: 1000m
       memory: 1Gi
     requests:
       cpu: 500m
       memory: 512Mi

   autoscaling:
     enabled: true
     minReplicas: 3
     maxReplicas: 10
     targetCPUUtilizationPercentage: 70
     targetMemoryUtilizationPercentage: 80

   ingress:
     enabled: true
     annotations:
       kubernetes.io/ingress.class: nginx
     hosts:
       - host: nootropic.example.com
         paths:
           - path: /
             pathType: Prefix
   ```

### 2. Monitoring and Logging

1. **Prometheus Configuration**
   ```yaml
   # monitoring/prometheus.yml
   global:
     scrape_interval: 15s
     evaluation_interval: 15s

   scrape_configs:
     - job_name: 'nootropic'
       kubernetes_sd_configs:
         - role: pod
       relabel_configs:
         - source_labels: [__meta_kubernetes_pod_label_app]
           regex: nootropic
           action: keep
         - source_labels: [__meta_kubernetes_pod_container_port_name]
           regex: metrics
           action: keep
         - source_labels: [__meta_kubernetes_pod_ip]
           target_label: __address__
         - source_labels: [__meta_kubernetes_pod_container_port_name]
           target_label: __metrics_path__
           replacement: /metrics
   ```

2. **Grafana Dashboard**
   ```json
   // monitoring/dashboards/nootropic.json
   {
     "dashboard": {
       "id": null,
       "title": "Nootropic Overview",
       "tags": ["nootropic"],
       "timezone": "browser",
       "panels": [
         {
           "title": "CPU Usage",
           "type": "graph",
           "datasource": "Prometheus",
           "targets": [
             {
               "expr": "rate(container_cpu_usage_seconds_total{container=\"nootropic\"}[5m])",
               "legendFormat": "CPU Usage"
             }
           ]
         },
         {
           "title": "Memory Usage",
           "type": "graph",
           "datasource": "Prometheus",
           "targets": [
             {
               "expr": "container_memory_usage_bytes{container=\"nootropic\"}",
               "legendFormat": "Memory Usage"
             }
           ]
         }
       ]
     }
   }
   ```

## Deployment Strategies

### 1. Rolling Updates

1. **Update Strategy**
   ```yaml
   # k8s/update-strategy.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: nootropic
   spec:
     strategy:
       type: RollingUpdate
       rollingUpdate:
         maxSurge: 1
         maxUnavailable: 0
     template:
       spec:
         containers:
         - name: nootropic
           image: nootropic:latest
   ```

2. **Rollback Strategy**
   ```yaml
   # k8s/rollback-strategy.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: nootropic
   spec:
     revisionHistoryLimit: 10
     template:
       spec:
         containers:
         - name: nootropic
           image: nootropic:latest
   ```

### 2. Blue-Green Deployment

1. **Service Configuration**
   ```yaml
   # k8s/blue-green.yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: nootropic
   spec:
     selector:
       app: nootropic
       version: blue
     ports:
     - port: 80
       targetPort: 3000
     type: LoadBalancer
   ```

2. **Deployment Switch**
   ```yaml
   # k8s/switch.yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: nootropic
   spec:
     selector:
       app: nootropic
       version: green
     ports:
     - port: 80
       targetPort: 3000
     type: LoadBalancer
   ```

## What's Next

- [Tutorial: Monitoring and Observability](tutorial_monitoring.md)
- [Tutorial: Performance Optimization](tutorial_performance.md)
- [Tutorial: Security Best Practices](tutorial_security.md)

## Additional Resources

- [Deployment Documentation](../DEPLOYMENT.md)
- [Architecture Documentation](../ARCHITECTURE.md)
- [Operations Documentation](../OPERATIONS.md) 