var b,t,d,l,start_time,
    Schedule, Scheduler, loop, setup, scheduler, queues = []; // Scheduler

// "Constants"
this.REPEAT = -1;

Scheduler = function(){
    this.queue = [];    
}
Scheduler.prototype.run = function(t,d,l){
    forEach(this.queue,function(idx,sched){
        sched.run(t,d,l);  
    });   
}
Scheduler.prototype.add = function(fn,state,delay,repeat){
    this.queue.push(new Schedule(fn,state,delay,repeat));   
}
Job = function(fn,state){
    this.fn = fn;
    this.state = state;
    this.lastrun = 0;
    this.runcount = 0;
}
// Jobs don't have any inherent time management, so just run it
Job.prototype.run = function(t,d,l){ 
    this.fn.call(this,t,d,l,this.state);
    return this;
}
Queue = function(delay){
    queues.push(this);
    this.running = false;
    this.delay = delay;
    this.queue = [];
    this.lastrun = 0;
    this.runcount = 0;
    this.starttime = 0;
    return this;
}
Queue.prototype.add = function(fn,state){
    this.queue.push(new Job(fn,state));
    return this;
}
Queue.prototype.run = function(){
    this.running = true;
    return this;
}
Queue.prototype.stop = function(){
    this.running = false;
    this.starttime = 0;
    this.lastrun = 0;
    return this;
}
Queue.prototype.next = function(t,d,l){
    if( !this.running ){
        return false;
    }
    if( this.lastrun == 0 )
        this.starttime = Date.now();
    if( this.lastrun == 0 ||  
        t - this.starttime >= (this.runcount * (this.delay+1)) ){
     
        this.queue.push(
            this.queue.shift().run(t,d,l)
        );
        
        this.lastrun = t;
            
        this.runcount++;
    }
}
Schedule = function(fn,state,delay,repeat){
    this.delay = delay;
    this.repeat = repeat;
    this.job = new Job(fn,state);
    //this.fn = fn;
    //this.lastrun = 0;
    //this.runcount = 0;
    //this.state = state;
    this.starttime = 0;
    this.nextrun = 0;
}
Schedule.prototype.run = function(t,d,l){  
    if( this.nextrun == 0 ) {
        this.starttime = Date.now();
        this.nextrun = this.delay;
    };
    if( 
        t - this.starttime >= this.nextrun
        && (this.repeat == -1 || this.repeat > 0)
    )
    {
        
        this.job.state.scheduler = {
            runcount: this.job.runcount,
            lastrun: this.job.lastrun
        };
            
        this.job.runcount++;
        this.nextrun = this.job.runcount * this.delay;
        
        //console.log( this.lastrun + this.delay + ':' + t );
        this.job.run(t,d,l);
        this.job.lastrun = t;
        
        if( this.repeat > 0 )
            this.repeat--;
    }
}

loop = function(){};
setup = function(){};
scheduler = new Scheduler();

// Private functions

function forEach(arr,fun){
    for(var x in arr){fun(x,arr[x]);}
}

function Loop(fn){
    loop = fn;    
}

function Setup(fn){
    setup = fn;   
}

function main(){
    t = Date.now(); // Time
    d = t-l;        // Time Delta
    scheduler.run(t,d,l);   // Run the users scheduler
    forEach(queues,function(idx,queue){
      queue.next(t,d,l);  
    })
    loop(t,d,l);    // Run the users loop
    l = t;          // Last
}

// Public methods

// Shorthand for <var>.scheduler.add();
this.schedule = function(fn,state,delay,repeat){
    scheduler.add(fn,state,delay,repeat)
}

this.scheduleIn = function(fn,state,delay,repeat,time){
    if( time == 0 ){
        scheduler.add(fn,state,delay,repeat);
    }else{
        setTimeout(function(){scheduler.add(fn,state,delay,repeat)},time); 
    }
}

this.run = function(bonescript){
    b = bonescript;
    console.log( 'Bonesched Running!' );
    setup();
    start_time = Date.now();
    
    console.log( 'Starting main loop at ' + start_time );
    setInterval(main, 1);
}

this.pinSet = function(t,d,l,state){
    b.digitalWrite(state.pin,state.state);
};
this.pinToggle = function(t,d,l,state){
    state.state = (state.state == b.LOW) ? b.HIGH : b.LOW;
    b.digitalWrite(state.pin,state.state);
};

// Export
this.Queue = Queue;
this.forEach = forEach;
this.Loop = Loop;
this.Setup = Setup;
this.scheduler = scheduler;