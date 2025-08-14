const adminAuth = document.getElementById('adminAuth');
const adminPanel = document.getElementById('adminPanel');
const emailForm = document.getElementById('emailForm');
const codeForm = document.getElementById('codeForm');
const loginError = document.getElementById('loginError');
const loginSuccess = document.getElementById('loginSuccess');
let adminEmail = '';

// Check session on page load
function checkSession() {
    fetch('./api/check_session.php')
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        })
        .then(data => {
            if (data.loggedIn) {
                adminEmail = data.email;
                adminAuth.style.display = 'none';
                adminPanel.style.display = 'block';
                loadProfile();
            } else {
                adminAuth.style.display = 'flex';
                adminPanel.style.display = 'none';
            }
        })
        .catch(err => {
            console.error('Session check error:', err);
            adminAuth.style.display = 'flex';
            adminPanel.style.display = 'none';
        });
}

// Send login code
emailForm.onsubmit = function(e) {
    e.preventDefault();
    adminEmail = document.getElementById('adminEmail').value.trim();
    loginError.style.display = loginSuccess.style.display = 'none';
    
    if (!adminEmail) {
        showError('Please enter your email.');
        return;
    }

    fetch('./api/send_login_code.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail })
    })
    .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
    })
    .then(data => {
        if (data.success) {
            showSuccess('Login code sent to your email.');
            emailForm.style.display = 'none';
            codeForm.style.display = 'flex';
        } else {
            showError(data.error || 'Failed to send code.');
        }
    })
    .catch(err => {
        console.error('Login error:', err);
        showError('Network error. Please try again.');
    });
};

// Verify code
codeForm.onsubmit = function(e) {
    e.preventDefault();
    const code = document.getElementById('adminCode').value.trim();
    loginError.style.display = loginSuccess.style.display = 'none';

    if (!code) {
        showError('Please enter the code.');
        return;
    }

    fetch('./api/verify_login_code.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, code })
    })
    .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
    })
    .then(data => {
        if (data.success) {
            showSuccess('Login successful!');
            setTimeout(() => {
                adminAuth.style.display = 'none';
                adminPanel.style.display = 'block';
                loadProfile();
            }, 500);
        } else {
            showError(data.error || 'Invalid code.');
        }
    })
    .catch(err => {
        console.error('Verification error:', err);
        showError('Network error. Please try again.');
    });
};

// Helper functions
function showError(message) {
    loginError.textContent = message;
    loginError.style.display = 'block';
}

function showSuccess(message) {
    loginSuccess.textContent = message;
    loginSuccess.style.display = 'block';
}

// Tab navigation
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = function() {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('ring-4'));
        btn.classList.add('ring-4', 'ring-blue-300');
        showTab(btn.dataset.tab);
    };
});

// Render tab content
function showTab(tab) {
    const tabContent = document.getElementById('tabContent');
    
    switch(tab) {
        case 'profile':
            tabContent.innerHTML = `<section class='bg-white rounded-xl shadow-lg p-6'>
                <h2 class='text-xl font-semibold mb-4'>Profile Management</h2>
                <form id='profileForm' class='flex flex-col gap-4' enctype="multipart/form-data">
                    <input type='text' id='adminName' name='name' placeholder='Name' class='p-3 rounded bg-gray-100' required>
                    <textarea id='adminBio' name='bio' rows='3' placeholder='Bio' class='p-3 rounded bg-gray-100'></textarea>
                    <input type='email' id='adminEmailProfile' name='contact_email' placeholder='Email' class='p-3 rounded bg-gray-100' required>
                    <input type='text' id='adminPhone' name='phone' placeholder='Phone' class='p-3 rounded bg-gray-100'>
                    <label class="text-gray-700 font-medium">Avatar:</label>
                    <input type='file' id='adminAvatar' name='avatar' accept="image/*" class='p-2 rounded bg-gray-100'>
                    <button type='submit' class='bg-blue-500 text-white px-6 py-3 rounded font-bold hover:bg-blue-700'>Update Profile</button>
                </form>
            </section>`;
            setupProfileForm();
            loadProfile();
            break;

        case 'projects':
            tabContent.innerHTML = `<section class='bg-white rounded-xl shadow-lg p-6'>
                <h2 class='text-xl font-semibold mb-4'>Project Management</h2>
                <button id='addProjectBtn' class='bg-green-500 text-white px-4 py-2 rounded font-bold mb-4 hover:bg-green-700'>Add New Project</button>
                <div id='projectList' class='space-y-4'></div>
            </section>`;
            document.getElementById('addProjectBtn').onclick = () => openProjectModal();
            loadProjects();
            break;

        case 'certificates':
            tabContent.innerHTML = `<section class='bg-white rounded-xl shadow-lg p-6'>
                <h2 class='text-xl font-semibold mb-4'>Certificate Management</h2>
                <button id='addCertBtn' class='bg-yellow-500 text-white px-4 py-2 rounded font-bold mb-4 hover:bg-yellow-700'>Add New Certificate</button>
                <div id='certList' class='space-y-4'></div>
            </section>`;
            document.getElementById('addCertBtn').onclick = () => openCertificateModal();
            loadCertificates();
            break;

        case 'contacts':
            tabContent.innerHTML = `<section class='bg-white rounded-xl shadow-lg p-6'>
                <h2 class='text-xl font-semibold mb-4'>Contact Messages</h2>
                <div id='contactMessages' class='space-y-4'></div>
            </section>`;
            loadContacts();
            break;
    }
}

// Modal functions
window.showModal = function(html) {
    document.getElementById('modalBox').innerHTML = html;
    document.getElementById('modalBg').style.display = 'flex';
};

window.closeModal = function() {
    document.getElementById('modalBg').style.display = 'none';
};

document.getElementById('modalBg').onclick = function(e) {
    if (e.target === this) closeModal();
};

// Profile functions
function setupProfileForm() {
    document.getElementById('profileForm').onsubmit = function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        formData.append('email', adminEmail);

        fetch('./api/update_profile.php', {
            method: 'POST',
            body: formData
        })
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        })
        .then(data => {
            if (data.success) {
                alert('Profile updated successfully!');
                if (data.profile) {
                    document.getElementById('headerName').textContent = data.profile.name;
                    if (data.profile.avatar) {
                        document.getElementById('headerAvatar').src = `./assets/${data.profile.avatar}`;
                    }
                }
            } else {
                alert(data.error || 'Failed to update profile.');
            }
        })
        .catch(err => {
            console.error('Profile update error:', err);
            alert('Network error. Please try again.');
        });
    };
}

function loadProfile() {
    fetch(`./api/get_profile.php?email=${encodeURIComponent(adminEmail)}`)
    .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
    })
    .then(data => {
        if (data.success && data.profile) {
            document.getElementById('adminName').value = data.profile.name || '';
            document.getElementById('adminBio').value = data.profile.bio || '';
            document.getElementById('adminEmailProfile').value = data.profile.contact_email || '';
            document.getElementById('adminPhone').value = data.profile.phone || '';
            
            if (data.profile.avatar) {
                document.getElementById('headerAvatar').src = `./assets/${data.profile.avatar}`;
            }
            if (data.profile.name) {
                document.getElementById('headerName').textContent = data.profile.name;
            }
        }
    })
    .catch(err => {
        console.error('Profile load error:', err);
    });
}

// Project functions
function loadProjects() {
    const projectList = document.getElementById('projectList');
    projectList.innerHTML = '<div class="text-center py-4">Loading projects...</div>';

    fetch('./api/get_projects.php')
    .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
    })
    .then(data => {
        if (data.success && data.projects && data.projects.length > 0) {
            projectList.innerHTML = '';
            data.projects.forEach(project => {
                const projectDiv = document.createElement('div');
                projectDiv.className = 'border rounded p-4 flex justify-between items-center';
                projectDiv.innerHTML = `
                    <div class="flex items-center gap-4">
                        <img src="./assets/uploads/${project.image}" class="w-16 h-16 object-cover rounded" alt="${project.title}" onerror="this.src='./assets/placeholder.png'">
                        <div>
                            <h3 class="font-semibold text-lg">${project.title}</h3>
                            <p class="text-gray-600 line-clamp-2">${project.description}</p>
                            <span class="text-sm text-gray-500">${project.type} | <a href="${project.url}" target="_blank" class="text-blue-500 underline">Visit</a></span>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button class="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500 editProjectBtn" data-id="${project.id}">Edit</button>
                        <button class="bg-red-500 px-3 py-1 rounded hover:bg-red-600 deleteProjectBtn" data-id="${project.id}">Delete</button>
                    </div>
                `;
                projectList.appendChild(projectDiv);
            });

            // Add event listeners for edit/delete buttons
            document.querySelectorAll('.editProjectBtn').forEach(btn => {
                btn.onclick = () => openProjectModal(btn.dataset.id, 'edit');
            });

            document.querySelectorAll('.deleteProjectBtn').forEach(btn => {
                btn.onclick = () => deleteProject(btn.dataset.id);
            });
        } else {
            projectList.innerHTML = '<div class="text-center py-4 text-gray-500">No projects found</div>';
        }
    })
    .catch(err => {
        console.error('Projects load error:', err);
        projectList.innerHTML = '<div class="text-center py-4 text-red-500">Failed to load projects</div>';
    });
}

function openProjectModal(id = null, mode = 'add') {
    let html = `<h2 class="text-xl font-semibold mb-4">${mode === 'add' ? 'Add' : 'Edit'} Project</h2>
        <form id="projectForm" class="flex flex-col gap-4" enctype="multipart/form-data">
            <input type="text" name="title" id="projectTitle" placeholder="Title" class="p-3 rounded bg-gray-100" required>
            <textarea name="description" id="projectDescription" placeholder="Description" class="p-3 rounded bg-gray-100" rows="3" required></textarea>
            <input type="text" name="url" id="projectURL" placeholder="Project URL" class="p-3 rounded bg-gray-100">
            <select name="type" id="projectType" class="p-3 rounded bg-gray-100" required>
                <option value="">Select Project Type</option>
                <option value="AI/ML">AI/ML</option>
                <option value="Cyber">Cyber</option>
                <option value="Other">Other</option>
            </select>
            <label class="text-gray-700 font-medium">Image:</label>
            <input type="file" name="image" id="projectImage" accept="image/*">
            <button type="submit" class="bg-blue-500 text-white px-6 py-3 rounded font-bold hover:bg-blue-700">${mode === 'add' ? 'Add Project' : 'Update Project'}</button>
        </form>`;
    showModal(html);

    if (mode === 'edit' && id) {
        fetch(`./api/get_project.php?id=${id}`)
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        })
        .then(data => {
            if (data.success && data.project) {
                document.getElementById('projectTitle').value = data.project.title;
                document.getElementById('projectDescription').value = data.project.description;
                document.getElementById('projectURL').value = data.project.url;
                document.getElementById('projectType').value = data.project.type;
            }
        })
        .catch(err => {
            console.error('Project load error:', err);
            alert('Failed to load project data');
        });
    }

    document.getElementById('projectForm').onsubmit = function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        if (mode === 'edit') formData.append('id', id);

        fetch(`./api/${mode === 'add' ? 'add_project.php' : 'update_project.php'}`, {
            method: 'POST',
            body: formData
        })
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        })
        .then(data => {
            if (data.success) {
                closeModal();
                loadProjects();
            } else {
                alert(data.error || 'Failed to save project');
            }
        })
        .catch(err => {
            console.error('Project save error:', err);
            alert('Network error. Please try again.');
        });
    };
}

function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;

    fetch(`./api/delete_project.php?id=${id}`, { 
        method: 'DELETE' 
    })
    .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
    })
    .then(data => {
        if (data.success) {
            loadProjects();
        } else {
            alert(data.error || 'Failed to delete project');
        }
    })
    .catch(err => {
        console.error('Project delete error:', err);
        alert('Network error. Please try again.');
    });
}

// Certificate functions
function loadCertificates() {
    const certList = document.getElementById('certList');
    certList.innerHTML = '<div class="text-center py-4">Loading certificates...</div>';

    fetch('./api/get_certificates.php')
    .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
    })
    .then(data => {
        if (data.success && data.certificates && data.certificates.length > 0) {
            certList.innerHTML = '';
            data.certificates.forEach(cert => {
                const certDiv = document.createElement('div');
                certDiv.className = 'border rounded p-4 flex justify-between items-center';
                certDiv.innerHTML = `
                    <div class="flex items-center gap-4">
                        <img src="./assets/uploads/${cert.image}" class="w-16 h-10 object-cover rounded" alt="${cert.title}" onerror="this.src='./assets/placeholder.png'">
                        <div>
                            <h3 class="font-semibold text-lg">${cert.title}</h3>
                            <p class="text-gray-600">${cert.provider} | ${cert.ProvidedDate}</p>
                            <a href="${cert.url}" target="_blank" class="text-blue-500 underline text-sm">View Certificate</a>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button class="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500 editCertBtn" data-id="${cert.id}">Edit</button>
                        <button class="bg-red-500 px-3 py-1 rounded hover:bg-red-600 deleteCertBtn" data-id="${cert.id}">Delete</button>
                    </div>
                `;
                certList.appendChild(certDiv);
            });

            // Add event listeners for edit/delete buttons
            document.querySelectorAll('.editCertBtn').forEach(btn => {
                btn.onclick = () => openCertificateModal(btn.dataset.id, 'edit');
            });

            document.querySelectorAll('.deleteCertBtn').forEach(btn => {
                btn.onclick = () => deleteCertificate(btn.dataset.id);
            });
        } else {
            certList.innerHTML = '<div class="text-center py-4 text-gray-500">No certificates found</div>';
        }
    })
    .catch(err => {
        console.error('Certificates load error:', err);
        certList.innerHTML = '<div class="text-center py-4 text-red-500">Failed to load certificates</div>';
    });
}

function openCertificateModal(id = null, mode = 'add') {
    let html = `<h2 class="text-xl font-semibold mb-4">${mode === 'add' ? 'Add' : 'Edit'} Certificate</h2>
        <form id="certForm" class="flex flex-col gap-4" enctype="multipart/form-data">
            <input type="text" name="title" id="certTitle" placeholder="Title" class="p-3 rounded bg-gray-100" required>
            <input type="text" name="provider" id="certProvider" placeholder="Provider" class="p-3 rounded bg-gray-100" required>
            <input type="date" name="ProvidedDate" id="certDate" placeholder="Provided Date" class="p-3 rounded bg-gray-100" required>
            <input type="text" name="url" id="certURL" placeholder="Certificate URL" class="p-3 rounded bg-gray-100">
            <label class="text-gray-700 font-medium">Image:</label>
            <input type="file" name="image" id="certImage" accept="image/*">
            <button type="submit" class="bg-blue-500 text-white px-6 py-3 rounded font-bold hover:bg-blue-700">${mode === 'add' ? 'Add Certificate' : 'Update Certificate'}</button>
        </form>`;

    showModal(html);

    if (mode === 'edit' && id) {
        fetch(`./api/get_certificate.php?id=${id}`)
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        })
        .then(data => {
            if (data.success && data.certificate) {
                document.getElementById('certTitle').value = data.certificate.title;
                document.getElementById('certProvider').value = data.certificate.provider;
                document.getElementById('certDate').value = data.certificate.ProvidedDate;
                document.getElementById('certURL').value = data.certificate.url;
            }
        })
        .catch(err => {
            console.error('Certificate load error:', err);
            alert('Failed to load certificate data');
        });
    }

    document.getElementById('certForm').onsubmit = function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        if (mode === 'edit') formData.append('id', id);

        fetch(`./api/${mode === 'add' ? 'add_certificate.php' : 'update_certificate.php'}`, {
            method: 'POST',
            body: formData
        })
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        })
        .then(data => {
            if (data.success) {
                closeModal();
                loadCertificates();
            } else {
                alert(data.error || 'Failed to save certificate');
            }
        })
        .catch(err => {
            console.error('Certificate save error:', err);
            alert('Network error. Please try again.');
        });
    };
}

function deleteCertificate(id) {
    if (!confirm('Are you sure you want to delete this certificate?')) return;

    fetch(`./api/delete_certificate.php?id=${id}`, { 
        method: 'DELETE' 
    })
    .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
    })
    .then(data => {
        if (data.success) {
            loadCertificates();
        } else {
            alert(data.error || 'Failed to delete certificate');
        }
    })
    .catch(err => {
        console.error('Certificate delete error:', err);
        alert('Network error. Please try again.');
    });
}

// Contact functions
function loadContacts() {
    const contactList = document.getElementById('contactMessages');
    contactList.innerHTML = '<div class="text-center py-4">Loading messages...</div>';

    fetch('./api/get_contacts.php')
    .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
    })
    .then(data => {
        if (data.success && data.contacts && data.contacts.length > 0) {
            contactList.innerHTML = '';
            data.contacts.forEach(contact => {
                const contactDiv = document.createElement('div');
                contactDiv.className = 'border rounded p-4 flex justify-between items-start';
                contactDiv.innerHTML = `
                    <div>
                        <h3 class="font-semibold text-lg">${contact.name}</h3>
                        <p class="text-gray-600">${contact.email}</p>
                        <p class="mt-2">${contact.message}</p>
                        <p class="text-gray-400 text-sm mt-1">${contact.created_at}</p>
                    </div>
                    <div class="flex gap-2">
                        <button class="bg-red-500 px-3 py-1 rounded hover:bg-red-600 deleteContactBtn" data-id="${contact.id}">Delete</button>
                    </div>
                `;
                contactList.appendChild(contactDiv);
            });

            // Add event listeners for delete buttons
            document.querySelectorAll('.deleteContactBtn').forEach(btn => {
                btn.onclick = () => deleteContact(btn.dataset.id);
            });
        } else {
            contactList.innerHTML = '<div class="text-center py-4 text-gray-500">No messages found</div>';
        }
    })
    .catch(err => {
        console.error('Contacts load error:', err);
        contactList.innerHTML = '<div class="text-center py-4 text-red-500">Failed to load messages</div>';
    });
}

function deleteContact(id) {
    if (!confirm('Are you sure you want to delete this message?')) return;

    fetch(`./api/delete_contact.php?id=${id}`, { 
        method: 'DELETE' 
    })
    .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
    })
    .then(data => {
        if (data.success) {
            loadContacts();
        } else {
            alert(data.error || 'Failed to delete message');
        }
    })
    .catch(err => {
        console.error('Contact delete error:', err);
        alert('Network error. Please try again.');
    });
}

// Initialize
checkSession();
showTab('profile');
document.querySelector('.tab-btn[data-tab="profile"]').classList.add('ring-4', 'ring-blue-300');