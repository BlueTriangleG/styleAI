# K8s Deployment

This directory is used to store k8s manifests (.yaml)

Once you created a manifest file, and you want to run it:

```sh
# make sure `kubectl` is installed and configured
kubectl apply -f <your-yaml-filename>.yaml
```


# Useful Commands
```sh
# Better to run as root, before running the following commands, run `export KUBECONFIG=xxx` to set envrionment variables first
# If you configured kubectl as a non-root user, you don't need to execute these two lines. 
sudo su -
export KUBECONFIG=/etc/kubernetes/admin.conf



kubectl get nodes

# get all pod info, listed with namespace and pod name
kubectl get pods -A

# `-o wide` will show which node each pod is running on
kubectl get pods -A -o wide

kubectl logs -n <name-space> <pod-name>

# check pod settings and current status
kubectl describe -n <name-space> <pod-name>

# check containers info
crictl --runtime-endpoint unix:///var/run/containerd/containerd.sock ps -a

# check container logs
crictl --runtime-endpoint unix:///var/run/containerd/containerd.sock logs <container-ID>

# similar to `docker ps`, also can run this on worker nodes
crictl ps

# Manually set label for nodes, sometimes nodes come with no label <none>
kubectl label node cognitix-prd-2 node-role.kubernetes.io/worker=worker


### If you want to use `kubectl` on worker nodes or other machine instead of control plane machine:

# first, from control plane machine, copy /etc/kubernetes/admon.conf to another machine (use scp or other secure method)
scp /etc/kubernetes/admin.conf xxx@xxx:~/.kube/config

# Then, for non-root user, set the ownership of config file
# mkdir -p $HOME/.kube
# sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# Then you can use `kubectl` on other machines
kubectl get nodes -A

# for root user (not recommended)
# export KUBECONFIG=/etc/kubernetes/admin.conf

```