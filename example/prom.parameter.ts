/**
 * Created by Rain on 2020/6/18
 */
import 'reflect-metadata';
import * as client from 'prom-client';
import { PromMethodCounter } from '../lib/decorator';
import { Counter, Gauge } from 'prom-client';
import {
  Counter1,
  MetricExecute,
  Gauge1,
} from '../lib/decorator/prom.paramter.decorator';

// const collectDefaultMetrics = client.collectDefaultMetrics;
// collectDefaultMetrics({ register: client.register });
//
// console.info(client.register.metrics());

export class Test {
  str: string;

  @PromMethodCounter()
  test(): string {
    console.info('test');
    return 's';
  }

  @MetricExecute()
  test2(
    test: any,
    test2: any,
    @Counter1({
      name: 'test_parameter_counter_name',
      help: 'test_parameter_counter_help',
      labelNames: ['test1', 'test2'],
    })
    counter?: Gauge<string>,
    @Gauge1({
      name: 'test_parameter_gauge_name',
      help: 'test_parameter_gauge_name',
    })
    gauge?: Counter<any>,
  ): string {
    counter.labels('t1', 't2').inc(1);
    (gauge as any).set(10);
    return 'test';
  }
}
client.register.setDefaultLabels({ test1: 'test', test2: 'test2' });

const test = new Test();
console.info(test.test());
// @ts-ignore
console.info(test.test2());

console.info(client.register.metrics());
