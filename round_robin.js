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
  jobTable.map((e)=>{total_extra+=e.CPUcycle}) //전체 작업 총량 계산
  let time =0,i=0;
  let arrived_job=[];
  let rr_result=[];
  while(total_extra > 0){  // 전체 작업을 완료했을경우 루프 탈출
    const i_module =i%jobTable.length; 
    if(jobTable[i_module].CPUcycle===0 ||jobTable[i_module].arrivalTime>time){ 
      //해당순번의 작업이 완료되었거나 도착하지않은 작업일경우 넘어감
    }else if(jobTable[i_module].CPUcycle > quantum){ 
      if(!arrived_job.includes(jobTable[i_module].jobName)){ 
        //처음 도착한 작업을 도착한작업배열에 확인후 없으면 넣어줌
        arrived_job.push(jobTable[i_module].jobName);
      }
      yield {job:jobTable[i_module].jobName,from:time,to:time+quantum} 
      time+=quantum; 
      jobTable[i_module].CPUcycle-=quantum; 
      total_extra -=quantum;
    }else if(jobTable[i_module].CPUcycle <= quantum){ //퀀텀이하의 작업이 남은경우
      if(!arrived_job.includes(jobTable[i_module].jobName)){
        //처음 도착한 작업을 도착한작업배열에 확인후 없으면 넣어줌
        arrived_job.push(jobTable[i_module].jobName); 
      }
      yield {job:jobTable[i_module].jobName,from:time,to:time+jobTable[i_module].CPUcycle}
      time+=jobTable[i_module].CPUcycle; //남은 작업만큼 time증가
      total_extra -= jobTable[i_module].CPUcycle;
      jobTable[i_module].CPUcycle=0;
      arrived_job.remove(jobTable[i_module].jobName);
      rr_result.push({job:jobTable[i_module].jobName,Turnaround:time-jobTable[i_module].arrivalTime});
    }
    if(arrived_job.length===0){ //도착한작업이 없는 경우 시간 흐름.
      time++;
    }
    i++;
  }
  console.log("all job clear");
  return rr_result;
}

function result_draw(rr,interval_handle){
  job_block =rr.next(); //generator함수 next(), 함수가 호출될때마다 다음yield값을 반환해준다.
  if(job_block.done){ //generator가 작업을 완료하여return 이 반환될경우 done은 true이다.
    clearInterval(interval_handle);//인터벌 핸들러 제거.(반복 정지.)
    const result_job_table = document.getElementById("result_job_table");
    const result_Turnaround_table = document.getElementById("result_Turnaround_table");
    const avg_turnaround = document.getElementById("avg_turnaround");
    let sum_turnaround = 0;
    job_block.value.map(v=>{ //각 작업마다 turnaround time을 그려주고 turnaround 총합 계산
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


