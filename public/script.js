const socket = io('/')
const videoGrid=document.getElementById('video-grid');
var myPeer = new Peer(undefined, {
    path:'/peerjs',
    host:'/',
    port:'443'
}); 

const peers = {}
const myVideo = document.createElement('video');
myVideo.muted = true;

let myVideoStream;

navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true,
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream)

    socket.on('user-connected', (userId) => {
        alert('Somebody Connected', userId)
        connectToNewUser(userId,stream)
    })

    myPeer.on('call', (call) => {
        console.log('answering')
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', (userVideoStream) => {
            console.log('succesfully answered')
            addVideoStream(video, userVideoStream)
        })
    })
    

    let msg = $('input');   //chat feature

    $('html').keydown(function(e) {
        if (e.which == 13 && msg.val().length !== 0) {
            console.log(msg.val())
            socket.emit('message', msg.val())
            msg.val('')
        }
    })
    
    socket.on('createMessage', message => {
        console.log('creating message:',message)
        $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
        scrollToBottom()
    })
       
} )

socket.on('user-disconnected', userId => {
	if (peers[userId]) peers[userId].close()
  })

myPeer.on('open', (id) => {
    socket.emit('join-room', ROOM_ID, id)
})


const connectToNewUser = (userId, stream) => {
    console.log('connect to new user')
	const call = myPeer.call(userId, stream)
    console.log('sucess')
	const video = document.createElement('video')
	call.on('stream', userVideoStream => {
        console.log('succesfully call')
		addVideoStream(video, userVideoStream)
	})
	call.on('close', () => {
		video.remove()
	})

	peers[userId] = call
}


const addVideoStream = (video, stream) => {
	video.srcObject = stream
	video.addEventListener('loadedmetadata', () => {
		video.play()
	})
	videoGrid.append(video)
}
  
const scrollToBottom = () => {
    let d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}

//mute/unmute feature
const muteUnmute = () => {   
    console.log(myVideoStream)       
	const enabled = myVideoStream.getAudioTracks()[0].enabled
	if (enabled) {
		myVideoStream.getAudioTracks()[0].enabled = false
		setUnmuteButton()
	} else {
		setMuteButton()
		myVideoStream.getAudioTracks()[0].enabled = true
	}
}
const setMuteButton = () => {       //changing icon
	const html = `
	  <i class="fas fa-microphone"></i>
	  <span>Mute</span>
	`
	document.querySelector('.mainMuteButton').innerHTML = html
}
const setUnmuteButton = () => {       //changing icon
	const html = `
	  <i class="unmute fas fa-microphone-slash"></i>
	  <span>Unmute</span>
	`
	document.querySelector('.mainMuteButton').innerHTML = html
}
//stop/play video
const playStop = () => {
	console.log('object')
	let enabled = myVideoStream.getVideoTracks()[0].enabled
	if (enabled) {
		myVideoStream.getVideoTracks()[0].enabled = false
		setPlayVideo()
	} else {
		setStopVideo()
		myVideoStream.getVideoTracks()[0].enabled = true
	}
}
const setStopVideo = () => {    //changing icons
	const html = `
	  <i class="fas fa-video"></i>
	  <span>Stop Video</span>
	`
	document.querySelector('.mainVideoButton').innerHTML = html
}
const setPlayVideo = () => {	//changing icons
	const html = `
	<i class="stop fas fa-video-slash"></i>
	  <span>Play Video</span>
	`
	document.querySelector('.mainVideoButton').innerHTML = html
}

//end