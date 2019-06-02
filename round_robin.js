class process {
  constructor(o){
    this.jobId = Number(o.jobID);
    this.arrivalTime = Number(o.arrivalTime);
    this.jobName = o.jobName;
    this.CPUcycle =  Number(o.CPUCycle);
  }
}

function* round_robin(process_info_object,quantum){
  let jobTable=[];
  quantum = Number(quantum);
  process_info_object.forEach(element => {
    jobTable.push(new process(element));
  });
  let total_extra =0;
  jobTable.map((e)=>{total_extra+=e.CPUcycle})
  let time =0,i=0;
  let arrived_job=[];
  let rr_result=[];
  while(total_extra > 0){
    const i_module =i%jobTable.length;
    if(jobTable[i_module].CPUcycle===0 ||jobTable[i_module].arrivalTime>time){
      
    }else if(jobTable[i_module].CPUcycle > quantum){
      if(!arrived_job.includes(jobTable[i_module].jobName)){
        arrived_job.push(jobTable[i_module].jobName);
      }
      yield {job:jobTable[i_module].jobName,from:time,to:time+quantum}
      time+=quantum;
      jobTable[i_module].CPUcycle-=quantum;
      total_extra -=quantum;
    }else if(jobTable[i_module].CPUcycle <= quantum){
      if(!arrived_job.includes(jobTable[i_module].jobName)){
        arrived_job.push(jobTable[i_module].jobName);
      }
      yield {job:jobTable[i_module].jobName,from:time,to:time+jobTable[i_module].CPUcycle}
      time+=jobTable[i_module].CPUcycle;
      total_extra -= jobTable[i_module].CPUcycle;
      jobTable[i_module].CPUcycle=0;
      rr_result.push({job:jobTable[i_module].jobName,Turnaround:time-jobTable[i_module].arrivalTime});
    }
    if(arrived_job.length===0){
      time++;
    }
    i++;
  }
  console.log("all job clear");
  return rr_result;
}

function result_draw(rr,interval_handle){
  job_block =rr.next();
  if(job_block.done){
    clearInterval(interval_handle);
    const result_job_table = document.getElementById("result_job_table");
    const result_Turnaround_table = document.getElementById("result_Turnaround_table");
    const avg_turnaround = document.getElementById("avg_turnaround");
    let sum_turnaround = 0;
    job_block.value.map(v=>{
      console.log(v);
      result_job_table.innerHTML += `<td>${v.job}</td>`
      result_Turnaround_table.innerHTML += `<td>${v.Turnaround}</td>`
      sum_turnaround+=v.Turnaround;
    });
    avg_turnaround.innerHTML = "Average Turnaround : "+sum_turnaround/job_block.value.length + ' ms';
    return;
  }
  console.log(job_block.value);
  const quantum = document.getElementById("quantum").value;
  const gantt = document.getElementById("Gantt");
gantt.innerHTML+=`
  <div 
    class="gantt-tic" 
    style="width:${15*(job_block.value.to-job_block.value.from)/quantum}%"
  >
    ${job_block.value.job}
    <div class="time_x" style="width:${15*(job_block.value.to-job_block.value.from)/quantum}%">
      ${job_block.value.to}
    </div>
  </div>`;
}


