const searchInput = document.getElementById('searchInput');
const suggestionsList = document.getElementById('suggestions');
const repoList = document.getElementById('repoList');

function debounce(fn, delay) {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(context, args), delay);
  };
}


async function fetchRepositories(query) {
  if (!query.trim()) {
    suggestionsList.innerHTML = '';
    return;
  }

  try {
    const response = await fetch(`https://api.github.com/search/repositories?q= ${encodeURIComponent(query)}&sort=stars&order=desc`);
    const data = await response.json();
    const repos = data.items ? data.items.slice(0, 5) : [];
    showSuggestions(repos);
  } catch (error) {
    console.error('Ошибка загрузки репозиториев:', error);
    suggestionsList.innerHTML = '';
  }
}


function showSuggestions(repos) {
  suggestionsList.innerHTML = '';
  repos.forEach(repo => {
    const li = document.createElement('li');
    li.textContent = `${repo.full_name}`;
    li.addEventListener('click', () => {
      addRepoToList(repo);
      searchInput.value = '';
      suggestionsList.innerHTML = '';
    });
    suggestionsList.appendChild(li);
  });
}


function addRepoToList(repo) {
  const existing = Array.from(repoList.children).find(item => item.dataset.repo === repo.id);
  if (existing) return;

  const li = document.createElement('li');
  li.className = 'repo-item';
  li.dataset.repo = repo.id;

  li.innerHTML = `
    <span><strong>${repo.name}</strong><br/>Автор: ${repo.owner.login}<br/>Звёзд: ${repo.stargazers_count}</span>
    <button class="delete-btn">Удалить</button>
  `;

  const deleteBtn = li.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', () => {
    repoList.removeChild(li);
  });

  repoList.appendChild(li);
}


searchInput.addEventListener('input', debounce((e) => {
  fetchRepositories(e.target.value);
}, 300));