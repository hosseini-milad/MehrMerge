const http = require("http");
const app = require("./app");

const server = http.createServer(app);

const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;

var os = require('os');

CHECK_CPU_USAGE_INTERVAL    = 3000*60; // every minute
HIGH_CPU_USAGE_LIMIT        = 20; // percentage

/*autoRestart = setInterval(function()
{
  const cpus = os.cpus();
const cpu = cpus;

// Accumulate every CPU times values
/*const total = Object.values(cpu.times).reduce(
    (acc, tv) => acc + tv, 0
);
*/
  /*const usage = process.cpuUsage();
  const currentCPUUsage = (usage.user ) * 1000;

  // Find out the percentage used for this specific CPU
  //const perc = currentCPUUsage / (total * 100);
  console.log(cpu);
  
    usage.lookup(process.pid, function(err, result) 
    {
        if(!err)
        {
            if(result.cpu > HIGH_CPU_USAGE_LIMIT)
            {
                // log
                //console.log('restart due to high cpu usage');

                // restart because forever will respawn your process
                //process.exit();
            }
        }
    });
}, CHECK_CPU_USAGE_INTERVAL);
*/

try{
// server listening 
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
}
catch{
  console.log(`another server running on port ${port}`)
}