const Prometheus = require("prometheus-client");
const { execFile, execFileSync } = require('child_process');

const macs = ['4c:65:a8:d9:ae:92']

const namespace = 'mi'

const client = new Prometheus();
const temperature = client.newGauge({ namespace, name: "temperature", help: "temperature" });
const humidity = client.newGauge({ namespace, name: "humidity", help: "humidity" });
const battery = client.newGauge({ namespace, name: "battery", help: "battery" });

collect = () => {
  console.log('collect', new Date());
  for (const mac of macs) {
    const child = execFileSync('./demo.py', ['--backend', 'bluepy', 'poll', mac], { timeout: 20000 })
    try {
      const data = JSON.parse(child.toString())
      temperature.set({ mac }, data['temperature'])
      humidity.set({ mac }, data['humidity'])
      battery.set({ mac }, data['battery'])
    } catch (e) {}
  }
}
collect()
setInterval(collect, 60000)
client.listen(9200)
