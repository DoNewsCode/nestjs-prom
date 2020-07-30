/**
 * Created by Rain on 2020/6/18
 */
import { Test, TestingModule } from '@nestjs/testing';
import * as assert from 'assert';
import { Counter, Gauge, register, Registry } from 'prom-client';

import {
  MetricType,
  MetricTypeCounter,
  MetricTypeGauge,
  PromModule,
} from '../lib';

describe('PromController', () => {
  beforeEach(() => {
    register.clear();
  });

  it('collection default is false', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PromModule.forRoot({
          withDefaultsMetrics: false,
        }),
      ],
    }).compile();

    const register = module.get<any, Registry>(Registry);

    assert.strictEqual('', register.metrics());
  });

  it('collection default is true', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PromModule.forRoot({})],
    }).compile();

    const register = module.get<any, Registry>(Registry);

    assert.strictEqual(register.metrics() !== '', true);
  });

  it('default labels', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PromModule.forRoot(
          {
            withDefaultsMetrics: false,
            defaultLabels: { env: 'testing' },
          },
          [
            {
              type: MetricType.Counter,
              configuration: {
                name: 'test_count',
                help: 'test count help',
                labelNames: ['field1', 'field2'],
              },
            } as MetricTypeCounter,
          ],
        ),
      ],
    }).compile();

    const register = module.get<any, Registry>(Registry);
    const counter = module.get<string, Counter<string>>('test_count');

    counter.labels('value1', 'value2').inc(1);

    const expectValue = `# HELP test_count test count help
# TYPE test_count counter
test_count{field1="value1",field2="value2",env="testing"} 1`;

    assert.strictEqual(
      register.getSingleMetricAsString('test_count'),
      expectValue,
    );
  });

  it('counter', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PromModule.forRoot({}, [
          {
            type: MetricType.Counter,
            configuration: {
              name: 'test_count',
              help: 'test count help',
              labelNames: ['field1', 'field2'],
            },
          } as MetricTypeCounter,
        ]),
      ],
    }).compile();

    const register = module.get<Registry>(Registry);
    const counter = module.get<any, Counter<string>>('test_count');

    counter.labels('value1', 'value2').inc(1);

    const expectValue = `# HELP test_count test count help
# TYPE test_count counter
test_count{field1="value1",field2="value2"} 1`;

    assert.strictEqual(
      register.getSingleMetricAsString('test_count'),
      expectValue,
    );
  });

  it('gauge', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PromModule.forRoot({}, [
          {
            type: MetricType.Gauge,
            configuration: {
              name: 'test_gauge',
              help: 'test gauge help',
              labelNames: ['field1', 'field2'],
            },
          } as MetricTypeGauge,
        ]),
      ],
    }).compile();

    const register = module.get<Registry>(Registry);
    const counter = module.get<any, Gauge<string>>('test_gauge');

    counter.labels('value1', 'value2').set(10);

    const expectValue = `# HELP test_gauge test gauge help
# TYPE test_gauge gauge
test_gauge{field1="value1",field2="value2"} 10`;

    assert.strictEqual(
      register.getSingleMetricAsString('test_gauge'),
      expectValue,
    );
  });
});
