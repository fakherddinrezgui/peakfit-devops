#!/bin/bash
echo "Récupération des nouvelles IPs..."

# Récupère les IPs depuis Terraform
cd ~/peakfit-devops/terraform
IP1=$(terraform output -json instance_public_ips | jq -r '.[0]')
IP2=$(terraform output -json instance_public_ips | jq -r '.[1]')

echo "IP1 = $IP1"
echo "IP2 = $IP2"

# Met à jour inventory.ini automatiquement
cat > ~/peakfit-devops/ansible/inventory.ini << INVENTORY
[web]
$IP1  ansible_user=ec2-user  ansible_ssh_private_key_file=~/.ssh/peakfit-key
$IP2  ansible_user=ec2-user  ansible_ssh_private_key_file=~/.ssh/peakfit-key
INVENTORY

echo "inventory.ini mis à jour !"
cat ~/peakfit-devops/ansible/inventory.ini

# Teste la connexion
echo "Test de connexion SSH..."
cd ~/peakfit-devops
ansible web -i ansible/inventory.ini -m ping \
  --ssh-extra-args='-o StrictHostKeyChecking=no'
